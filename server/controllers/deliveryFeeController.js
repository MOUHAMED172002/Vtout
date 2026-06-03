/**
 * deliveryFeeController.js
 * Gestion admin des tranches de frais de livraison embarqués.
 */

import { Config } from '../models/index.js';
import { getDeliveryFeeTiers, computeDeliveryFee, computePublicPrice, decomposePublicPrice } from '../services/deliveryFeeService.js';

/**
 * GET /api/admin/delivery-fee-tiers
 * Retourne les tranches actuellement configurées.
 */
export const getDeliveryFeeTiersConfig = async (req, res) => {
    try {
        const tiers = await getDeliveryFeeTiers();
        // Remplace Infinity par null pour la sérialisation JSON
        const serializable = tiers.map((t, i) => ({
            ...t,
            max: t.max === Infinity ? null : t.max,
            isLast: i === tiers.length - 1,
        }));
        res.json({ tiers: serializable });
    } catch (err) {
        console.error('[deliveryFeeController] getDeliveryFeeTiersConfig:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * PUT /api/admin/delivery-fee-tiers
 * Body: { tiers: [{ min, max, fee }] }
 * Sauvegarde les nouvelles tranches en DB.
 */
export const updateDeliveryFeeTiersConfig = async (req, res) => {
    try {
        const { tiers } = req.body;

        if (!Array.isArray(tiers) || tiers.length === 0) {
            return res.status(400).json({ error: 'Le tableau de tranches est requis et ne peut pas être vide.' });
        }

        // Validation : chaque tranche doit avoir min, fee (positif)
        for (const t of tiers) {
            if (t.min === undefined || t.fee === undefined || t.fee < 0) {
                return res.status(400).json({ error: 'Chaque tranche doit avoir min et fee (≥ 0).' });
            }
        }

        // Trier par min et normaliser : la dernière tranche a max = Infinity (null en JSON)
        const sorted = [...tiers].sort((a, b) => a.min - b.min);
        sorted[sorted.length - 1].max = null; // = Infinity en service

        const value = JSON.stringify(sorted);
        const [config, created] = await Config.findOrCreate({
            where: { key: 'delivery_fee_tiers' },
            defaults: { value, group: 'marketplace', description: 'Grille des frais de livraison dynamiques (JSON)' }
        });
        if (!created) {
            await config.update({ value });
        }

        res.json({ success: true, tiers: sorted, message: 'Tranches mises à jour avec succès.' });
    } catch (err) {
        console.error('[deliveryFeeController] updateDeliveryFeeTiersConfig:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * POST /api/admin/delivery-fee-simulate
 * Body: { supplier_price }
 * Retourne la simulation du prix public pour un prix vendeur donné.
 * Endpoint public (pas de requireAdmin) pour le portail vendeur.
 */
export const simulateDeliveryFee = async (req, res) => {
    try {
        const { supplier_price } = req.body;
        const price = Number(supplier_price);

        if (!price || price <= 0) {
            return res.status(400).json({ error: 'supplier_price doit être un nombre positif.' });
        }

        const tiers = await getDeliveryFeeTiers();
        const deliveryFee = computeDeliveryFee(price, tiers);
        const publicPrice = computePublicPrice(price, tiers);

        // Lire le taux de commission depuis DB
        let commissionRate = 0.10;
        try {
            const configRate = await Config.findOne({ where: { key: 'commission_rate' } });
            if (configRate?.value) commissionRate = parseFloat(configRate.value) / 100;
        } catch {}

        const supplierEarnings = Math.round(price * (1 - commissionRate));

        res.json({
            supplier_price: price,
            delivery_fee: deliveryFee,
            public_price: publicPrice,
            commission_rate_pct: Math.round(commissionRate * 100),
            supplier_earnings: supplierEarnings,
            breakdown: `${price} F (vendeur) + ${deliveryFee} F (livraison) = ${publicPrice} F (public)`,
        });
    } catch (err) {
        console.error('[deliveryFeeController] simulateDeliveryFee:', err);
        res.status(500).json({ error: err.message });
    }
};
