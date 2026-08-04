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
    const defaults = [
        { key: 'referral_referrer_reward', value: '2000', group: 'referral', description: "Montant (FCFA) du coupon offert au parrain après la 1ère commande confirmée de son filleul" },
        { key: 'referral_referred_reward', value: '1000', group: 'referral', description: "Montant (FCFA) du coupon de bienvenue offert au filleul dès son inscription" },
        { key: 'referral_min_order_amount', value: '5000', group: 'referral', description: "Montant minimum de commande (FCFA) pour utiliser un coupon de parrainage" },
        { key: 'referral_coupon_validity_days', value: '60', group: 'referral', description: "Durée de validité (jours) des coupons de parrainage" },
    ];
    const rows = await Promise.all(defaults.map((d) =>
        Config.findOrCreate({ where: { key: d.key }, defaults: d }).then(([row]) => row)
    ));
    const map = {};
    rows.forEach((r) => { map[r.key] = r.value; });
    return {
        referrerReward: Number(map.referral_referrer_reward) || 2000,
        referredReward: Number(map.referral_referred_reward) || 1000,
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

async function createPersonalCoupon({ amount, minOrderAmount, validityDays, description }) {
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
            referred_coupon_code: referredCouponCode,
        });

        res.status(201).json({ referral, welcomeCouponCode: referredCouponCode });
    } catch (error) {
        console.error('applyReferralCode error:', error);
        res.status(500).json({ error: "Erreur lors de l'application du code de parrainage" });
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
    referral.referrer_coupon_code = referrerCouponCode;
    referral.rewarded_at = new Date();
    await referral.save();
}
