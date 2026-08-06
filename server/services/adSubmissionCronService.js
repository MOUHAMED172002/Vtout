import cron from 'node-cron';
import { Op } from 'sequelize';
import { AdSubmission, AdCampaign, AdDistributorProfile } from '../models/index.js';
import { sendWhatsAppMessage } from './whatsappService.js';

const LIVE_CHECK_TIMEOUT_HOURS = 6;

// Rejette automatiquement les campagnes réclamées mais jamais complétées (les
// 2 captures) une fois la fenêtre de la campagne expirée — libère la place
// pour d'autres distributeurs plutôt que de la garder bloquée indéfiniment.
async function expireIncompleteSubmissions() {
    try {
        const now = new Date();
        const stale = await AdSubmission.findAll({
            where: { status: { [Op.in]: ['pending', 'awaiting_late'] } },
            include: [{ model: AdCampaign, as: 'campaign' }]
        });

        let expiredCount = 0;
        for (const submission of stale) {
            if (!submission.campaign || new Date(submission.campaign.end_date) >= now) continue;

            await submission.update({
                status: 'rejected',
                rejection_reason: submission.status === 'pending'
                    ? "Campagne expirée avant l'envoi de la 1ère capture."
                    : "Campagne expirée avant l'envoi de la 2ème capture."
            });

            if (submission.campaign.claimed_count > 0) {
                await submission.campaign.decrement('claimed_count', { by: 1 });
            }
            expiredCount++;
        }

        if (expiredCount > 0) {
            console.log(`[AD CRON] ${expiredCount} soumission(s) incomplète(s) expirée(s) et rejetée(s)`);
        }
    } catch (err) {
        console.error('[AD CRON] expireIncompleteSubmissions error:', err.message);
    }
}

// Une vérification "live" ignorée trop longtemps (le distributeur ne répond pas
// à la demande de capture fraîche) est un signal de fraude probable — on
// rejette et on compte ça comme un flag, comme un doublon détecté.
async function expireIgnoredLiveChecks() {
    try {
        const cutoff = new Date(Date.now() - LIVE_CHECK_TIMEOUT_HOURS * 60 * 60 * 1000);
        const stale = await AdSubmission.findAll({
            where: {
                status: 'live_check',
                live_check_requested_at: { [Op.lt]: cutoff }
            }
        });

        for (const submission of stale) {
            await submission.update({
                status: 'rejected',
                rejection_reason: `Vérification live demandée mais non répondue sous ${LIVE_CHECK_TIMEOUT_HOURS}h.`,
                flagged: true,
                flag_reason: submission.flag_reason
                    ? `${submission.flag_reason} | Vérification live ignorée.`
                    : 'Vérification live ignorée.'
            });

            const campaign = await AdCampaign.findByPk(submission.campaign_id);
            if (campaign && campaign.claimed_count > 0) {
                await campaign.decrement('claimed_count', { by: 1 });
            }

            const profile = await AdDistributorProfile.findByPk(submission.distributor_id);
            if (profile) {
                await profile.increment('flag_count', { by: 1 });
                if (profile.verified_phone) {
                    sendWhatsAppMessage(profile.verified_phone, '⚠️ *Vtout Distribution* : votre soumission a été refusée faute de réponse à la vérification demandée.').catch(() => {});
                }
            }
        }

        if (stale.length > 0) {
            console.log(`[AD CRON] ${stale.length} vérification(s) live ignorée(s) → rejetée(s)`);
        }
    } catch (err) {
        console.error('[AD CRON] expireIgnoredLiveChecks error:', err.message);
    }
}

export function startAdSubmissionCron() {
    // Toutes les heures à la minute 30
    cron.schedule('30 * * * *', async () => {
        await expireIncompleteSubmissions();
        await expireIgnoredLiveChecks();
    });
    console.log('✅ [CRON] Expiration des soumissions publicitaires planifiée (toutes les heures)');
}
