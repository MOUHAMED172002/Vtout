import { Op } from 'sequelize';
import { AdCampaign, AdDistributorProfile, AdSubmission, Profile, sequelize } from '../models/index.js';
import { sendWhatsAppMessage } from '../services/whatsappService.js';

const TRUST_UPGRADE_THRESHOLD = 5; // soumissions validées sans flag → passage en "trusted"

// ── Campagnes ────────────────────────────────────────────────────────────

export const createCampaign = async (req, res) => {
    try {
        const { title, description, creative_url, rate_per_view, min_views, max_reward_amount, max_distributors, start_date, end_date } = req.body;
        if (!title || !creative_url || !rate_per_view || !start_date || !end_date) {
            return res.status(400).json({ error: 'Champs obligatoires manquants (titre, visuel, taux par vue, dates)' });
        }
        if (Number(rate_per_view) <= 0) {
            return res.status(400).json({ error: 'Le taux par vue doit être supérieur à 0' });
        }
        const campaign = await AdCampaign.create({
            title,
            description: description || null,
            creative_url,
            rate_per_view: Number(rate_per_view),
            min_views: min_views ? Number(min_views) : null,
            max_reward_amount: max_reward_amount ? Number(max_reward_amount) : null,
            max_distributors: max_distributors ? Number(max_distributors) : null,
            start_date,
            end_date,
            created_by: req.auth?.userId || null
        });
        res.status(201).json(campaign);
    } catch (error) {
        console.error('createCampaign error:', error);
        res.status(500).json({ error: 'Erreur lors de la création de la campagne' });
    }
};

export const updateCampaign = async (req, res) => {
    try {
        const campaign = await AdCampaign.findByPk(req.params.id);
        if (!campaign) return res.status(404).json({ error: 'Campagne introuvable' });
        const { title, description, creative_url, rate_per_view, min_views, max_reward_amount, max_distributors, start_date, end_date, status } = req.body;
        await campaign.update({
            ...(title !== undefined && { title }),
            ...(description !== undefined && { description }),
            ...(creative_url !== undefined && { creative_url }),
            ...(rate_per_view !== undefined && { rate_per_view: Number(rate_per_view) }),
            ...(min_views !== undefined && { min_views: min_views ? Number(min_views) : null }),
            ...(max_reward_amount !== undefined && { max_reward_amount: max_reward_amount ? Number(max_reward_amount) : null }),
            ...(max_distributors !== undefined && { max_distributors: max_distributors ? Number(max_distributors) : null }),
            ...(start_date !== undefined && { start_date }),
            ...(end_date !== undefined && { end_date }),
            ...(status !== undefined && { status })
        });
        res.json(campaign);
    } catch (error) {
        console.error('updateCampaign error:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
};

export const deleteCampaign = async (req, res) => {
    try {
        const campaign = await AdCampaign.findByPk(req.params.id);
        if (!campaign) return res.status(404).json({ error: 'Campagne introuvable' });
        const usageCount = await AdSubmission.count({ where: { campaign_id: campaign.id } });
        if (usageCount > 0) {
            await campaign.update({ status: 'completed' });
            return res.json({ message: 'Campagne déjà réclamée par des distributeurs : marquée terminée au lieu d’être supprimée.', campaign });
        }
        await campaign.destroy();
        res.json({ message: 'Campagne supprimée' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
};

export const getAllCampaigns = async (req, res) => {
    try {
        const campaigns = await AdCampaign.findAll({ order: [['created_at', 'DESC']] });
        const withStats = await Promise.all(campaigns.map(async (c) => {
            const [verified, paid, flagged] = await Promise.all([
                AdSubmission.count({ where: { campaign_id: c.id, status: { [Op.in]: ['verified', 'paid'] } } }),
                AdSubmission.count({ where: { campaign_id: c.id, status: 'paid' } }),
                AdSubmission.count({ where: { campaign_id: c.id, flagged: true } })
            ]);
            return { ...c.toJSON(), stats: { verified, paid, flagged } };
        }));
        res.json(withStats);
    } catch (error) {
        console.error('getAllCampaigns error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// ── File de modération ──────────────────────────────────────────────────

export const getModerationQueue = async (req, res) => {
    try {
        const submissions = await AdSubmission.findAll({
            where: { status: { [Op.in]: ['under_review', 'live_check'] } },
            include: [
                { model: AdCampaign, as: 'campaign', attributes: ['id', 'title', 'rate_per_view', 'min_views', 'max_reward_amount'] },
                {
                    model: AdDistributorProfile, as: 'distributor',
                    attributes: ['id', 'verified_phone', 'trust_level', 'flag_count', 'total_submissions', 'total_verified'],
                    include: [{ model: Profile, as: 'user', attributes: ['id', 'fullname', 'email'] }]
                }
            ],
            // Les soumissions flaguées remontent en premier.
            order: [['flagged', 'DESC'], ['created_at', 'ASC']]
        });
        res.json(submissions);
    } catch (error) {
        console.error('getModerationQueue error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// Soumissions validées, en attente de paiement manuel (Mobile Money, hors
// système — comme les PayoutRequest fournisseurs).
export const getPayoutQueue = async (req, res) => {
    try {
        const submissions = await AdSubmission.findAll({
            where: { status: 'verified' },
            include: [
                { model: AdCampaign, as: 'campaign', attributes: ['id', 'title', 'rate_per_view'] },
                {
                    model: AdDistributorProfile, as: 'distributor',
                    attributes: ['id', 'verified_phone', 'momo_number', 'trust_level'],
                    include: [{ model: Profile, as: 'user', attributes: ['id', 'fullname'] }]
                }
            ],
            order: [['payout_eligible_at', 'ASC']]
        });
        res.json(submissions);
    } catch (error) {
        console.error('getPayoutQueue error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const getSubmissionDetail = async (req, res) => {
    try {
        const submission = await AdSubmission.findByPk(req.params.id, {
            include: [
                { model: AdCampaign, as: 'campaign' },
                {
                    model: AdDistributorProfile, as: 'distributor',
                    include: [{ model: Profile, as: 'user', attributes: ['id', 'fullname', 'email', 'phone'] }]
                }
            ]
        });
        if (!submission) return res.status(404).json({ error: 'Soumission introuvable' });

        // Historique complet du distributeur, pour donner du contexte à l'admin.
        const history = await AdSubmission.findAll({
            where: { distributor_id: submission.distributor_id, id: { [Op.ne]: submission.id } },
            include: [{ model: AdCampaign, as: 'campaign', attributes: ['id', 'title'] }],
            order: [['created_at', 'DESC']],
            limit: 20
        });

        res.json({ submission, history });
    } catch (error) {
        console.error('getSubmissionDetail error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const approveSubmission = async (req, res) => {
    try {
        const submission = await AdSubmission.findByPk(req.params.id);
        if (!submission) return res.status(404).json({ error: 'Soumission introuvable' });
        if (!['under_review', 'live_check'].includes(submission.status)) {
            return res.status(400).json({ error: 'Cette soumission ne peut pas être approuvée dans son état actuel' });
        }

        const campaign = await AdCampaign.findByPk(submission.campaign_id);
        if (!campaign) return res.status(404).json({ error: 'Campagne introuvable' });

        // Vues retenues : celles corrigées par l'admin si fournies, sinon celles
        // déclarées par le distributeur — c'est cette valeur qui fixe la récompense.
        const viewsOverride = req.body?.views_verified;
        const viewsVerified = viewsOverride != null && viewsOverride !== ''
            ? Number(viewsOverride)
            : (submission.views_reported ?? 0);
        if (!Number.isFinite(viewsVerified) || viewsVerified < 0) {
            return res.status(400).json({ error: 'Nombre de vues invalide' });
        }

        let rewardAmount = viewsVerified * Number(campaign.rate_per_view);
        if (campaign.max_reward_amount) {
            rewardAmount = Math.min(rewardAmount, Number(campaign.max_reward_amount));
        }

        const profile = await AdDistributorProfile.findByPk(submission.distributor_id);
        const isNewAccount = !profile || profile.trust_level === 'new';
        const payoutEligibleAt = isNewAccount
            ? new Date(Date.now() + 48 * 60 * 60 * 1000)
            : new Date();

        await submission.update({
            status: 'verified',
            views_verified: viewsVerified,
            reward_amount: rewardAmount,
            payout_eligible_at: payoutEligibleAt,
            admin_notes: req.body?.admin_notes || submission.admin_notes
        });

        if (profile) {
            const newVerifiedCount = profile.total_verified + 1;
            const updates = { total_verified: newVerifiedCount };
            // Passage automatique en compte de confiance après plusieurs validations propres.
            if (profile.trust_level === 'new' && newVerifiedCount >= TRUST_UPGRADE_THRESHOLD && profile.flag_count === 0) {
                updates.trust_level = 'trusted';
            }
            await profile.update(updates);
        }

        res.json(submission);
    } catch (error) {
        console.error('approveSubmission error:', error);
        res.status(500).json({ error: 'Erreur lors de la validation' });
    }
};

export const rejectSubmission = async (req, res) => {
    try {
        const { reason } = req.body;
        const submission = await AdSubmission.findByPk(req.params.id);
        if (!submission) return res.status(404).json({ error: 'Soumission introuvable' });

        await submission.update({ status: 'rejected', rejection_reason: reason || 'Non conforme' });

        // Libère la place pour d'autres distributeurs.
        const campaign = await AdCampaign.findByPk(submission.campaign_id);
        if (campaign && campaign.claimed_count > 0) {
            await campaign.decrement('claimed_count', { by: 1 });
        }

        res.json(submission);
    } catch (error) {
        console.error('rejectSubmission error:', error);
        res.status(500).json({ error: 'Erreur lors du rejet' });
    }
};

export const requestLiveCheck = async (req, res) => {
    try {
        const submission = await AdSubmission.findByPk(req.params.id, {
            include: [{ model: AdDistributorProfile, as: 'distributor' }]
        });
        if (!submission) return res.status(404).json({ error: 'Soumission introuvable' });
        if (!['under_review', 'awaiting_late'].includes(submission.status)) {
            return res.status(400).json({ error: 'Vérification live non applicable à cette étape' });
        }

        await submission.update({ status: 'live_check', live_check_requested_at: new Date() });

        const phone = submission.distributor?.verified_phone;
        if (phone) {
            await sendWhatsAppMessage(phone, `🔍 *Vtout Distribution* : merci d'envoyer immédiatement une nouvelle capture de votre Statut en cours pour valider votre participation.`).catch(() => {});
        }

        res.json(submission);
    } catch (error) {
        console.error('requestLiveCheck error:', error);
        res.status(500).json({ error: 'Erreur lors de la demande de vérification' });
    }
};

export const markPaid = async (req, res) => {
    try {
        const submission = await AdSubmission.findByPk(req.params.id);
        if (!submission) return res.status(404).json({ error: 'Soumission introuvable' });
        if (submission.status !== 'verified') {
            return res.status(400).json({ error: 'Seules les soumissions validées peuvent être marquées payées' });
        }
        if (submission.payout_eligible_at && new Date(submission.payout_eligible_at) > new Date()) {
            return res.status(400).json({ error: `Paiement pas encore éligible (délai anti-fraude jusqu'au ${new Date(submission.payout_eligible_at).toLocaleString('fr-FR')})` });
        }

        await submission.update({ status: 'paid', paid_at: new Date() });

        const profile = await AdDistributorProfile.findByPk(submission.distributor_id);
        if (profile) {
            await profile.increment('total_paid_amount', { by: Number(submission.reward_amount) });
        }

        res.json(submission);
    } catch (error) {
        console.error('markPaid error:', error);
        res.status(500).json({ error: 'Erreur lors du marquage payé' });
    }
};

// ── Distributeurs ────────────────────────────────────────────────────────

export const getAllDistributors = async (req, res) => {
    try {
        const distributors = await AdDistributorProfile.findAll({
            include: [{ model: Profile, as: 'user', attributes: ['id', 'fullname', 'email', 'phone'] }],
            order: [['created_at', 'DESC']]
        });
        res.json(distributors);
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const banDistributor = async (req, res) => {
    try {
        const { reason } = req.body;
        const profile = await AdDistributorProfile.findByPk(req.params.id);
        if (!profile) return res.status(404).json({ error: 'Distributeur introuvable' });
        await profile.update({ trust_level: 'banned', banned_at: new Date(), ban_reason: reason || 'Banni par un administrateur' });
        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const unbanDistributor = async (req, res) => {
    try {
        const profile = await AdDistributorProfile.findByPk(req.params.id);
        if (!profile) return res.status(404).json({ error: 'Distributeur introuvable' });
        await profile.update({ trust_level: 'new', banned_at: null, ban_reason: null, flag_count: 0 });
        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
