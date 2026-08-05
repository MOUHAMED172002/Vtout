import crypto from 'crypto';
import { Profile, Referral, Coupon, Config } from '../models/index.js';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sans caractères ambigus (0/O, 1/I/L)

function generateCode(length = 7) {
    let code = '';
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
        code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
    }
    return code;
}

// Lit la config de récompenses (montants, validité) depuis la table configs
// — modifiable depuis Admin > Paramètres (groupe "referral") sans toucher
// au code. Crée les entrées avec des valeurs par défaut au premier appel
// si elles n'existent pas encore.
async function getReferralSettings() {
    // Démarrent à 0 : tant que l'administrateur n'a pas fixé de montant
    // depuis Admin > Paramètres (groupe "referral"), aucun coupon n'est
    // généré (voir createPersonalCoupon, qui n'émet rien si amount <= 0).
    const defaults = [
        { key: 'referral_referrer_reward', value: '0', group: 'referral', description: "Montant (FCFA) du coupon offert au parrain après la 1ère commande confirmée de son filleul — 0 = désactivé" },
        { key: 'referral_referred_reward', value: '0', group: 'referral', description: "Montant (FCFA) du coupon de bienvenue offert au filleul dès son inscription — 0 = désactivé" },
        { key: 'referral_min_order_amount', value: '5000', group: 'referral', description: "Montant minimum de commande (FCFA) pour utiliser un coupon de parrainage" },
        { key: 'referral_coupon_validity_days', value: '60', group: 'referral', description: "Durée de validité (jours) des coupons de parrainage" },
    ];
    const rows = await Promise.all(defaults.map((d) =>
        Config.findOrCreate({ where: { key: d.key }, defaults: d }).then(([row]) => row)
    ));
    const map = {};
    rows.forEach((r) => { map[r.key] = r.value; });
    return {
        referrerReward: Number(map.referral_referrer_reward) || 0,
        referredReward: Number(map.referral_referred_reward) || 0,
        minOrderAmount: Number(map.referral_min_order_amount) || 5000,
        validityDays: Number(map.referral_coupon_validity_days) || 60,
    };
}

async function ensureReferralCode(profile) {
    if (profile.referral_code) return profile.referral_code;
    let code;
    for (let attempt = 0; attempt < 5; attempt++) {
        code = generateCode();
        const existing = await Profile.findOne({ where: { referral_code: code } });
        if (!existing) break;
        code = null;
    }
    if (!code) code = `${generateCode()}${Date.now().toString(36).slice(-3)}`.toUpperCase();
    profile.referral_code = code;
    await profile.save();
    return code;
}

// Tant que l'administrateur n'a pas fixé de montant > 0 pour cette
// récompense (Admin > Paramètres > Parrainage), aucun coupon n'est créé.
async function createPersonalCoupon({ amount, minOrderAmount, validityDays, description }) {
    if (!amount || amount <= 0) return null;
    const now = new Date();
    const end = new Date(now.getTime() + validityDays * 24 * 60 * 60 * 1000);
    let code;
    for (let attempt = 0; attempt < 5; attempt++) {
        code = `PARRAIN-${generateCode(6)}`;
        const existing = await Coupon.findOne({ where: { code } });
        if (!existing) break;
        code = null;
    }
    if (!code) code = `PARRAIN-${generateCode(6)}-${Date.now().toString(36).slice(-3)}`.toUpperCase();

    await Coupon.create({
        code,
        discount_type: 'fixed_amount',
        discount_value: amount,
        min_order_amount: minOrderAmount,
        start_date: now,
        end_date: end,
        usage_limit: 1,
        active: true,
    });
    void description; // réservé si on ajoute un jour un champ "description" côté Coupon
    return code;
}

// GET /referrals/me — code personnel + statistiques du parrainage.
export const getMyReferralInfo = async (req, res) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: 'Non autorisé' });

        const profile = await Profile.findByPk(userId);
        if (!profile) return res.status(404).json({ error: 'Profil introuvable' });

        const code = await ensureReferralCode(profile);
        const settings = await getReferralSettings();

        const referrals = await Referral.findAll({ where: { referrer_id: userId } });
        const totalInvited = referrals.length;
        const totalRewarded = referrals.filter((r) => r.status === 'rewarded').length;

        res.json({
            code,
            shareUrl: `https://vtout.com/?ref=${code}`,
            referrerReward: settings.referrerReward,
            referredReward: settings.referredReward,
            minOrderAmount: settings.minOrderAmount,
            totalInvited,
            totalRewarded,
            pendingCount: totalInvited - totalRewarded,
        });
    } catch (error) {
        console.error('getMyReferralInfo error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// POST /referrals/apply — appelé juste après l'inscription d'un nouveau
// compte pour rattacher un code de parrainage. Le filleul reçoit son
// coupon de bienvenue immédiatement ; le parrain ne reçoit le sien qu'à
// la 1ère commande confirmée du filleul (voir orderController.js).
export const applyReferralCode = async (req, res) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: 'Non autorisé' });

        const { code } = req.body;
        if (!code || typeof code !== 'string') {
            return res.status(400).json({ error: 'Code de parrainage manquant' });
        }

        const referrer = await Profile.findOne({ where: { referral_code: code.trim().toUpperCase() } });
        if (!referrer) {
            return res.status(404).json({ error: 'Code de parrainage invalide' });
        }
        if (referrer.id === userId) {
            return res.status(400).json({ error: 'Vous ne pouvez pas utiliser votre propre code' });
        }

        const alreadyReferred = await Referral.findOne({ where: { referred_id: userId } });
        if (alreadyReferred) {
            return res.status(400).json({ error: 'Un code de parrainage a déjà été appliqué à ce compte' });
        }

        const settings = await getReferralSettings();
        const referredCouponCode = await createPersonalCoupon({
            amount: settings.referredReward,
            minOrderAmount: settings.minOrderAmount,
            validityDays: settings.validityDays,
            description: 'Coupon de bienvenue — parrainage',
        });

        const referral = await Referral.create({
            referrer_id: referrer.id,
            referred_id: userId,
            status: 'pending',
            referred_coupon_code: referredCouponCode || null,
        });

        res.status(201).json({ referral, welcomeCouponCode: referredCouponCode || null });
    } catch (error) {
        console.error('applyReferralCode error:', error);
        res.status(500).json({ error: "Erreur lors de l'application du code de parrainage" });
    }
};

// GET /referrals/admin/settings — récompenses actuelles (0 = désactivé).
export const getReferralSettingsAdmin = async (req, res) => {
    try {
        const settings = await getReferralSettings();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// PATCH /referrals/admin/settings — c'est ici que l'admin active le parrainage
// (les récompenses valent 0 par défaut tant qu'il n'a rien réglé).
export const updateReferralSettings = async (req, res) => {
    try {
        const { referrerReward, referredReward, minOrderAmount, validityDays } = req.body;
        const fields = [
            ['referral_referrer_reward', referrerReward],
            ['referral_referred_reward', referredReward],
            ['referral_min_order_amount', minOrderAmount],
            ['referral_coupon_validity_days', validityDays],
        ];
        for (const [key, val] of fields) {
            if (val === undefined || val === null || val === '') continue;
            const numeric = Number(val);
            if (!Number.isFinite(numeric) || numeric < 0) {
                return res.status(400).json({ error: `Valeur invalide pour ${key}` });
            }
            const [row] = await Config.findOrCreate({ where: { key }, defaults: { key, value: String(numeric), group: 'referral' } });
            await row.update({ value: String(numeric) });
        }
        const settings = await getReferralSettings();
        res.json(settings);
    } catch (error) {
        console.error('updateReferralSettings error:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
};

// GET /referrals/admin/all — liste complète pour le tableau de bord admin.
export const getAllReferralsAdmin = async (req, res) => {
    try {
        const referrals = await Referral.findAll({
            include: [
                { model: Profile, as: 'referrer', attributes: ['id', 'fullname', 'email'] },
                { model: Profile, as: 'referred', attributes: ['id', 'fullname', 'email'] },
            ],
            order: [['created_at', 'DESC']]
        });
        res.json(referrals);
    } catch (error) {
        console.error('getAllReferralsAdmin error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// GET /referrals/admin/stats — agrégats pour les cartes du tableau de bord.
export const getReferralStatsAdmin = async (req, res) => {
    try {
        const total = await Referral.count();
        const rewarded = await Referral.count({ where: { status: 'rewarded' } });
        const settings = await getReferralSettings();
        res.json({
            totalInvites: total,
            totalRewarded: rewarded,
            totalPending: total - rewarded,
            estimatedPayout: rewarded * settings.referrerReward,
            settings,
        });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// Appelée par orderController.js quand une commande passe en "confirmée"
// pour la première fois — récompense le parrain si l'utilisateur de cette
// commande était un filleul en attente. Fire-and-forget, ne doit jamais
// faire échouer la mise à jour de la commande elle-même.
export async function rewardReferrerIfPending(userId, orderId) {
    if (!userId) return;
    const referral = await Referral.findOne({ where: { referred_id: userId, status: 'pending' } });
    if (!referral) return;

    const settings = await getReferralSettings();
    const referrerCouponCode = await createPersonalCoupon({
        amount: settings.referrerReward,
        minOrderAmount: settings.minOrderAmount,
        validityDays: settings.validityDays,
        description: 'Coupon de parrainage — filleul actif',
    });

    referral.status = 'rewarded';
    referral.order_id = orderId;
    referral.referrer_coupon_code = referrerCouponCode || null;
    referral.rewarded_at = new Date();
    await referral.save();
}
