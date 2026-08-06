import crypto from 'crypto';
import { Op } from 'sequelize';
import { AdCampaign, AdDistributorProfile, AdSubmission, Profile, Otp, sequelize } from '../models/index.js';
import { sendWhatsAppMessage } from '../services/whatsappService.js';
import { computePerceptualHash, isLikelyDuplicate } from '../services/adFraudService.js';
import { uploadBufferToCloudinary } from '../services/adUploadService.js';

// Nombre d'heures de délai de paiement pour un compte "new" (le temps qu'un
// admin puisse repérer un problème avant que l'argent parte).
const NEW_ACCOUNT_PAYOUT_DELAY_HOURS = 48;
// Trop de soumissions flaguées → bannissement automatique.
const AUTO_BAN_FLAG_THRESHOLD = 3;

const cleanPhone = (p) => (p || '').replace(/\D/g, '');

// ── Inscription / vérification du numéro WhatsApp ──────────────────────────

export const requestPhoneOtp = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ error: 'Numéro WhatsApp requis' });

        const phoneClean = cleanPhone(phone);
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await Otp.create({ phone: phoneClean, code, expires_at: expiresAt });

        const result = await sendWhatsAppMessage(phone, `Vtout Distribution - Votre code de vérification est : *${code}*. Ne le partagez avec personne.`);
        if (!result.success) {
            return res.status(400).json({ error: "Échec de l'envoi du code", message: result.error });
        }

        res.json({ message: 'Code envoyé' });
    } catch (error) {
        console.error('requestPhoneOtp error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const verifyPhoneOtp = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { phone, code } = req.body;
        if (!phone || !code) return res.status(400).json({ error: 'Téléphone et code requis' });

        const phoneClean = cleanPhone(phone);
        const otpEntry = await Otp.findOne({
            where: { phone: phoneClean, code, is_used: false, expires_at: { [Op.gt]: new Date() } },
            order: [['createdAt', 'DESC']]
        });
        if (!otpEntry) return res.status(400).json({ error: 'Code invalide ou expiré' });
        await otpEntry.update({ is_used: true });

        // Un même numéro WhatsApp ne peut être vérifié que par un seul compte
        // distributeur — bloque le multi-compte trivial (un numéro = une identité).
        const existingWithPhone = await AdDistributorProfile.findOne({ where: { verified_phone: phoneClean, user_id: { [Op.ne]: userId } } });
        if (existingWithPhone) {
            return res.status(409).json({ error: 'Ce numéro est déjà vérifié sur un autre compte distributeur.' });
        }

        const [profile] = await AdDistributorProfile.findOrCreate({
            where: { user_id: userId },
            defaults: { id: crypto.randomUUID(), user_id: userId }
        });

        if (profile.trust_level === 'banned') {
            return res.status(403).json({ error: 'Ce compte est banni du programme de distribution.' });
        }

        await profile.update({
            verified_phone: phoneClean,
            phone_verified_at: new Date(),
            momo_number: profile.momo_number || phoneClean
        });

        res.json({ message: 'Numéro vérifié avec succès', profile });
    } catch (error) {
        console.error('verifyPhoneOtp error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const getMyDistributorProfile = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const profile = await AdDistributorProfile.findOne({ where: { user_id: userId } });
        res.json(profile);
    } catch (error) {
        console.error('getMyDistributorProfile error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const updateMomoNumber = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { momo_number } = req.body;
        if (!momo_number) return res.status(400).json({ error: 'Numéro Mobile Money requis' });

        const profile = await AdDistributorProfile.findOne({ where: { user_id: userId } });
        if (!profile) return res.status(404).json({ error: "Profil distributeur introuvable — vérifiez d'abord votre numéro." });

        await profile.update({ momo_number: cleanPhone(momo_number) });
        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// ── Campagnes disponibles ───────────────────────────────────────────────────

export const getAvailableCampaigns = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const profile = await AdDistributorProfile.findOne({ where: { user_id: userId } });

        const now = new Date();
        const campaigns = await AdCampaign.findAll({
            where: {
                status: 'active',
                start_date: { [Op.lte]: now },
                end_date: { [Op.gte]: now }
            },
            order: [['created_at', 'DESC']]
        });

        let myCampaignIds = new Set();
        if (profile) {
            const mine = await AdSubmission.findAll({ where: { distributor_id: profile.id }, attributes: ['campaign_id'] });
            myCampaignIds = new Set(mine.map(m => m.campaign_id));
        }

        const available = campaigns
            .filter(c => c.max_distributors == null || c.claimed_count < c.max_distributors)
            .map(c => ({ ...c.toJSON(), already_claimed: myCampaignIds.has(c.id) }));

        res.json(available);
    } catch (error) {
        console.error('getAvailableCampaigns error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const claimCampaign = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const userId = req.auth.userId;
        const { id } = req.params;

        const profile = await AdDistributorProfile.findOne({ where: { user_id: userId }, transaction });
        if (!profile) {
            await transaction.rollback();
            return res.status(403).json({ error: 'Vérifiez votre numéro WhatsApp avant de participer.' });
        }
        if (profile.trust_level === 'banned') {
            await transaction.rollback();
            return res.status(403).json({ error: 'Ce compte est banni du programme de distribution.' });
        }

        const campaign = await AdCampaign.findByPk(id, { transaction, lock: true });
        if (!campaign) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Campagne introuvable' });
        }
        const now = new Date();
        if (campaign.status !== 'active' || now < campaign.start_date || now > campaign.end_date) {
            await transaction.rollback();
            return res.status(400).json({ error: "Cette campagne n'est plus disponible" });
        }
        if (campaign.max_distributors != null && campaign.claimed_count >= campaign.max_distributors) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Toutes les places de cette campagne sont prises' });
        }

        const already = await AdSubmission.findOne({ where: { campaign_id: campaign.id, distributor_id: profile.id }, transaction });
        if (already) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Vous avez déjà réclamé cette campagne' });
        }

        // Le délai individuel est TOUJOURS de 24h à partir de la réclamation,
        // quelle que soit la durée d'ouverture de la campagne elle-même.
        const claimDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        const submission = await AdSubmission.create({
            id: crypto.randomUUID(),
            campaign_id: campaign.id,
            distributor_id: profile.id,
            status: 'pending',
            claimed_at: now,
            claim_deadline_at: claimDeadline
        }, { transaction });

        await campaign.increment('claimed_count', { by: 1, transaction });
        await profile.increment('total_submissions', { by: 1, transaction });

        await transaction.commit();
        res.status(201).json(submission);
    } catch (error) {
        await transaction.rollback();
        console.error('claimCampaign error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// ── Mes soumissions ──────────────────────────────────────────────────────

export const getMySubmissions = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const profile = await AdDistributorProfile.findOne({ where: { user_id: userId } });
        if (!profile) return res.json([]);

        const submissions = await AdSubmission.findAll({
            where: { distributor_id: profile.id },
            include: [{ model: AdCampaign, as: 'campaign' }],
            order: [['created_at', 'DESC']]
        });
        res.json(submissions);
    } catch (error) {
        console.error('getMySubmissions error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// Vérifie qu'une soumission appartient bien au distributeur connecté.
async function loadOwnedSubmission(req) {
    const userId = req.auth.userId;
    const profile = await AdDistributorProfile.findOne({ where: { user_id: userId } });
    if (!profile) return { error: 'Profil distributeur introuvable' };
    const submission = await AdSubmission.findOne({ where: { id: req.params.id, distributor_id: profile.id } });
    if (!submission) return { error: 'Soumission introuvable' };
    return { profile, submission };
}

// Détecte si ce hash ressemble à une capture déjà soumise ailleurs (autre
// campagne, autre compte) — coeur de l'anti-fraude "capture recyclée".
async function checkForDuplicateHash(hash, excludeSubmissionId) {
    const candidates = await AdSubmission.findAll({
        where: {
            id: { [Op.ne]: excludeSubmissionId },
            [Op.or]: [
                { screenshot_early_hash: { [Op.not]: null } },
                { screenshot_late_hash: { [Op.not]: null } }
            ]
        },
        attributes: ['id', 'distributor_id', 'screenshot_early_hash', 'screenshot_late_hash']
    });
    for (const c of candidates) {
        if (c.screenshot_early_hash && isLikelyDuplicate(hash, c.screenshot_early_hash)) return c;
        if (c.screenshot_late_hash && isLikelyDuplicate(hash, c.screenshot_late_hash)) return c;
    }
    return null;
}

async function flagSubmission(submission, reason) {
    await submission.update({ flagged: true, flag_reason: reason });
    const profile = await AdDistributorProfile.findByPk(submission.distributor_id);
    if (profile) {
        const newFlagCount = profile.flag_count + 1;
        const updates = { flag_count: newFlagCount };
        if (newFlagCount >= AUTO_BAN_FLAG_THRESHOLD) {
            updates.trust_level = 'banned';
            updates.banned_at = new Date();
            updates.ban_reason = `Bannissement automatique après ${newFlagCount} soumissions flaguées (captures dupliquées).`;
        }
        await profile.update(updates);
    }
}

export const submitEarlyScreenshot = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Capture manquante' });
        const { profile, submission, error } = await loadOwnedSubmission(req);
        if (error) return res.status(404).json({ error });
        if (submission.status !== 'pending') {
            return res.status(400).json({ error: 'Cette étape a déjà été complétée pour cette soumission' });
        }

        const hash = await computePerceptualHash(req.file.buffer);
        const duplicate = await checkForDuplicateHash(hash, submission.id);

        const uploaded = await uploadBufferToCloudinary(req.file.buffer);

        await submission.update({
            screenshot_early_url: uploaded.secure_url,
            screenshot_early_hash: hash,
            screenshot_early_at: new Date(),
            status: 'awaiting_late'
        });

        if (duplicate) {
            await flagSubmission(submission, `Capture précoce identique/similaire à la soumission ${duplicate.id} (compte ${duplicate.distributor_id === profile.id ? 'identique' : 'différent'}).`);
        }

        res.json({ message: 'Capture précoce enregistrée', flagged: !!duplicate });
    } catch (error) {
        console.error('submitEarlyScreenshot error:', error);
        res.status(500).json({ error: 'Erreur lors du traitement de la capture' });
    }
};

export const submitLateScreenshot = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Capture manquante' });
        const { profile, submission, error } = await loadOwnedSubmission(req);
        if (error) return res.status(404).json({ error });
        if (submission.status !== 'awaiting_late') {
            return res.status(400).json({ error: "Envoyez d'abord la capture précoce, ou cette étape est déjà complétée." });
        }

        // La récompense dépend du nombre de vues — saisi ici par le distributeur
        // (il lit le chiffre affiché sous son Statut), vérifié ensuite par l'admin
        // en modération avant validation.
        const viewsReported = parseInt(req.body?.views_reported, 10);
        if (!Number.isFinite(viewsReported) || viewsReported < 0) {
            return res.status(400).json({ error: 'Indiquez le nombre de vues affiché sous votre Statut.' });
        }

        const hash = await computePerceptualHash(req.file.buffer);
        // On compare aussi à la capture précoce de CETTE soumission : deux captures
        // identiques espacées de 24h sont suspectes (statut probablement supprimé
        // puis la même image réutilisée), sauf s'il s'agit d'un visuel très statique.
        const duplicateElsewhere = await checkForDuplicateHash(hash, submission.id);
        const sameAsEarly = submission.screenshot_early_hash && isLikelyDuplicate(hash, submission.screenshot_early_hash);

        const uploaded = await uploadBufferToCloudinary(req.file.buffer);

        await submission.update({
            screenshot_late_url: uploaded.secure_url,
            screenshot_late_hash: hash,
            screenshot_late_at: new Date(),
            views_reported: viewsReported,
            status: 'under_review'
        });

        if (duplicateElsewhere) {
            await flagSubmission(submission, `Capture tardive identique/similaire à la soumission ${duplicateElsewhere.id} (compte ${duplicateElsewhere.distributor_id === profile.id ? 'identique' : 'différent'}).`);
        } else if (sameAsEarly) {
            await flagSubmission(submission, "Les captures précoce et tardive sont identiques — probable capture unique réutilisée deux fois plutôt qu'un statut resté en ligne 24h.");
        }

        res.json({ message: 'Capture tardive enregistrée, soumission en cours de revue', flagged: !!(duplicateElsewhere || sameAsEarly) });
    } catch (error) {
        console.error('submitLateScreenshot error:', error);
        res.status(500).json({ error: 'Erreur lors du traitement de la capture' });
    }
};

export const submitLiveCheckScreenshot = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Capture manquante' });
        const { submission, error } = await loadOwnedSubmission(req);
        if (error) return res.status(404).json({ error });
        if (submission.status !== 'live_check') {
            return res.status(400).json({ error: "Aucune vérification live en attente pour cette soumission." });
        }

        const uploaded = await uploadBufferToCloudinary(req.file.buffer);
        await submission.update({
            live_check_screenshot_url: uploaded.secure_url,
            live_check_submitted_at: new Date(),
            status: 'under_review'
        });

        res.json({ message: 'Vérification envoyée, merci !' });
    } catch (error) {
        console.error('submitLiveCheckScreenshot error:', error);
        res.status(500).json({ error: 'Erreur lors du traitement de la capture' });
    }
};

export { NEW_ACCOUNT_PAYOUT_DELAY_HOURS };
