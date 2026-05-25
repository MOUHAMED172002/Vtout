/**
 * deliveryFeeService.js
 * ─────────────────────────────────────────────────────────────
 * Modèle de prix :
 *   Le vendeur entre un prix vendeur brut P_vendeur.
 *   Le prix client final = P_vendeur + frais marketing/transport.
 *   La commission admin est prélevée uniquement sur le prix vendeur.
 *
 * Principe :
 *   Prix public = Prix vendeur + Frais livraison (selon tranche)
 *   Gain net fournisseur = Prix vendeur - Commission admin
 *   Commission admin = Prix vendeur × taux_commission
 * ─────────────────────────────────────────────────────────────
 */

import { Config } from '../models/index.js';

// Tranches par défaut si aucune config n'est en DB
const DEFAULT_TIERS = [
    { min: 0,     max: 500,    fee: 300  },  // 250F vendeur → 550F public
    { min: 500,   max: 2000,   fee: 500  },  // 1000F vendeur → 1500F public
    { min: 2000,  max: 5000,   fee: 700  },  // 3000F vendeur → 3700F public
    { min: 5000,  max: 15000,  fee: 1000 },  // 10000F vendeur → 11000F public
    { min: 15000, max: Infinity, fee: 1500 }, // 20000F vendeur → 21500F public
];

/**
 * Lit les tranches depuis la DB (clé: 'delivery_fee_tiers').
 * Retourne les tranches par défaut si la clé n'existe pas encore.
 */
export async function getDeliveryFeeTiers() {
    try {
        const config = await Config.findOne({ where: { key: 'delivery_fee_tiers' } });
        if (config && config.value) {
            const parsed = JSON.parse(config.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
                // Normalise: s'assure que la dernière tranche va jusqu'à l'infini
                parsed[parsed.length - 1].max = Infinity;
                return parsed;
            }
        }
    } catch (err) {
        console.warn('[DeliveryFeeService] Impossible de lire les tranches DB, utilisation des valeurs par défaut.', err.message);
    }
    return DEFAULT_TIERS;
}

/**
 * Calcule les frais de livraison pour un prix vendeur donné.
 * @param {number} supplierPrice - Le prix proposé par le vendeur
 * @param {Array}  tiers         - Les tranches (optionnel, sinon rechargé depuis DB)
 * @returns {number} Les frais de livraison en FCFA
 */
export function computeDeliveryFee(supplierPrice, tiers = DEFAULT_TIERS) {
    const price = Number(supplierPrice) || 0;
    for (const tier of tiers) {
        if (price >= tier.min && price < tier.max) {
            return tier.fee;
        }
    }
    // Fallback: dernière tranche
    return tiers[tiers.length - 1]?.fee ?? 1000;
}

/**
 * Calcule le prix public à partir du prix vendeur.
 * Prix public = Prix vendeur + Frais livraison (selon tranche)
 * @param {number} supplierPrice - Le prix proposé par le vendeur
 * @param {Array}  tiers
 * @returns {number}
 */
export function computePublicPrice(supplierPrice, tiers = DEFAULT_TIERS) {
    const fee = computeDeliveryFee(supplierPrice, tiers);
    return Math.round(Number(supplierPrice) + fee);
}

/**
 * Calcule le prix vendeur net depuis le prix public.
 * Inverse de computePublicPrice (approximatif, par dichotomie simple).
 * @param {number} publicPrice
 * @param {number} commissionRate (ex: 0.10 = 10%)
 * @param {Array}  tiers
 * @returns {{ supplierPrice: number, deliveryFee: number, supplierEarnings: number }}
 */
export function decomposePublicPrice(publicPrice, commissionRate = 0.10, tiers = DEFAULT_TIERS) {
    // On cherche la tranche qui correspond au prix vendeur probable
    // Prix vendeur estimé = Prix public - frais de la tranche la plus probable
    // On itère les tranches pour trouver la cohérente
    for (const tier of tiers) {
        const estimatedSupplier = publicPrice - tier.fee;
        if (estimatedSupplier >= tier.min && estimatedSupplier < tier.max) {
            const earnings = Math.round(estimatedSupplier * (1 - commissionRate));
            return {
                supplierPrice: estimatedSupplier,
                deliveryFee: tier.fee,
                supplierEarnings: earnings,
            };
        }
    }
    // Fallback
    const fallbackFee = tiers[tiers.length - 1]?.fee ?? 1000;
    const sp = Math.round(publicPrice - fallbackFee);
    return {
        supplierPrice: sp,
        deliveryFee: fallbackFee,
        supplierEarnings: Math.round(sp * (1 - commissionRate)),
    };
}
