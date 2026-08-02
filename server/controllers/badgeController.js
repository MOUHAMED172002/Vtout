import crypto from 'crypto';
import { Config, Supplier, SellerBadgeSubscription } from '../models/index.js';
import { createFedapayTransaction } from '../services/fedapayService.js';

const DEFAULT_BADGE_PRICE = '5000';
const BADGE_DURATION_DAYS = 30;

const getBadgePrice = async () => {
    const [config] = await Config.findOrCreate({
        where: { key: 'seller_badge_monthly_price' },
        defaults: { value: DEFAULT_BADGE_PRICE, group: 'seller_badge', description: 'Montant mensuel (XOF) du badge Vendeur Certifié' }
    });
    return parseFloat(config.value) || 0;
};

// GET /api/badge/price — montant fixé par l'admin
export const getPrice = async (req, res) => {
    try {
        const amount = await getBadgePrice();
        res.json({ amount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PATCH /api/badge/price — admin uniquement
export const updatePrice = async (req, res) => {
    try {
        const { amount } = req.body;
        const numericAmount = parseFloat(amount);
        if (!Number.isFinite(numericAmount) || numericAmount < 0) {
            return res.status(400).json({ error: 'Montant invalide' });
        }
        const [config] = await Config.findOrCreate({
            where: { key: 'seller_badge_monthly_price' },
            defaults: { value: String(numericAmount), group: 'seller_badge', description: 'Montant mensuel (XOF) du badge Vendeur Certifié' }
        });
        await config.update({ value: String(numericAmount) });
        res.json({ amount: numericAmount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/badge/me — statut du fournisseur connecté
export const getMyStatus = async (req, res) => {
    try {
        if (!req.auth.supplierId) return res.status(404).json({ error: 'Fournisseur introuvable' });
        const supplier = await Supplier.findOne({ where: { id: req.auth.supplierId } });
        if (!supplier) return res.status(404).json({ error: 'Fournisseur introuvable' });

        const amount = await getBadgePrice();
        const history = await SellerBadgeSubscription.findAll({
            where: { supplier_id: supplier.id },
            order: [['created_at', 'DESC']],
            limit: 20
        });

        res.json({
            is_certified: !!supplier.is_certified,
            certified_badge_expires_at: supplier.certified_badge_expires_at,
            monthly_price: amount,
            history
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /api/badge/subscribe — initie un paiement FedaPay pour (re)certifier la boutique
export const subscribe = async (req, res) => {
    try {
        if (!req.auth.supplierId) return res.status(404).json({ error: 'Fournisseur introuvable' });
        const supplier = await Supplier.findOne({ where: { id: req.auth.supplierId } });
        if (!supplier) return res.status(404).json({ error: 'Fournisseur introuvable' });

        const now = new Date();
        const currentExpiry = supplier.certified_badge_expires_at ? new Date(supplier.certified_badge_expires_at) : null;
        if (supplier.is_certified && currentExpiry && currentExpiry > now) {
            return res.status(400).json({ error: 'Vous avez déjà un badge certifié actif. Le renouvellement sera possible à son expiration.' });
        }

        const monthlyPrice = await getBadgePrice();
        if (!monthlyPrice || monthlyPrice <= 0) {
            return res.status(400).json({ error: "Le montant de l'abonnement n'a pas encore été configuré par l'administrateur" });
        }

        const months = Math.min(24, Math.max(1, parseInt(req.body.months, 10) || 1));
        const amount = monthlyPrice * months;

        const periodStart = now;
        const periodEnd = new Date(periodStart.getTime() + months * BADGE_DURATION_DAYS * 24 * 60 * 60 * 1000);

        const subscriptionId = crypto.randomUUID();
        await SellerBadgeSubscription.create({
            id: subscriptionId,
            supplier_id: supplier.id,
            amount,
            months,
            status: 'pending',
            period_start: periodStart,
            period_end: periodEnd
        });

        const supplierPortalUrl = process.env.SUPPLIER_PORTAL_URL || 'http://localhost:5174';
        const callbackUrl = `${supplierPortalUrl}/badge-certifie/success?subscription_id=${subscriptionId}`;

        const syntheticOrder = {
            id: subscriptionId,
            total_amount: amount,
            guest_name: supplier.name,
            guest_email: supplier.email || 'vendeur@vtout.com',
            guest_phone: supplier.whatsapp || supplier.phone || '00000000',
        };
        const customer = {
            fullname: supplier.name,
            email: supplier.email || 'vendeur@vtout.com',
            phone: supplier.whatsapp || supplier.phone || '00000000',
        };

        const result = await createFedapayTransaction(syntheticOrder, customer, callbackUrl, {
            type: 'seller_badge_subscription',
            subscription_id: subscriptionId
        });

        await SellerBadgeSubscription.update(
            { payment_id: String(result.transactionId) },
            { where: { id: subscriptionId } }
        );

        res.json({
            checkoutUrl: result.checkoutUrl,
            amount,
            months,
            subscriptionId
        });
    } catch (error) {
        console.error('[Badge Subscribe] Error:', error);
        res.status(500).json({ error: 'Erreur lors de la création du paiement' });
    }
};

// GET /api/badge/admin/subscriptions — admin: historique global
export const getAllSubscriptions = async (req, res) => {
    try {
        const subscriptions = await SellerBadgeSubscription.findAll({
            include: [{ model: Supplier, as: 'supplier', attributes: ['id', 'name', 'email', 'is_certified', 'certified_badge_expires_at'] }],
            order: [['created_at', 'DESC']]
        });
        res.json(subscriptions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/badge/admin/certified — admin: liste des vendeurs certifiés
export const getCertifiedSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.findAll({
            where: { is_certified: true },
            order: [['certified_badge_expires_at', 'ASC']]
        });
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PATCH /api/badge/admin/:supplierId/revoke — admin: révoque manuellement le badge
export const revokeBadge = async (req, res) => {
    try {
        const supplier = await Supplier.findByPk(req.params.supplierId);
        if (!supplier) return res.status(404).json({ error: 'Fournisseur introuvable' });

        await supplier.update({ is_certified: false, certified_badge_expires_at: null });
        res.json({ message: 'Badge révoqué', supplier });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
