import cron from 'node-cron';
import { Op } from 'sequelize';
import { Dispute, Notification, Order, Profile } from '../models/index.js';
import { notifyAdmin, sendWhatsAppMessage } from './whatsappService.js';
import crypto from 'crypto';

const ESCALATION_HOURS = 72;

async function escalateStaleDisputes() {
    try {
        const cutoff = new Date(Date.now() - ESCALATION_HOURS * 60 * 60 * 1000);

        const stale = await Dispute.findAll({
            where: {
                status: 'open',
                created_at: { [Op.lt]: cutoff },
            },
            include: [{ model: Profile, as: 'user', attributes: ['fullname', 'phone'] }],
        });

        if (stale.length === 0) return;

        for (const dispute of stale) {
            await dispute.update({ status: 'under_review' });

            // Notification in-app au client
            await Notification.create({
                id: crypto.randomUUID(),
                user_id: dispute.user_id,
                title: '⏰ Litige escaladé',
                message: `Votre litige #${dispute.id.slice(0, 8)} n'a pas été traité sous ${ESCALATION_HOURS}h. Il a été escaladé en priorité haute.`,
                type: 'warning',
                is_read: false,
            }).catch(() => {});

            // WhatsApp client si disponible
            if (dispute.user?.phone) {
                sendWhatsAppMessage(
                    dispute.user.phone,
                    `⏰ Vtout — Votre litige #${dispute.id.slice(0, 8)} a été escaladé en priorité haute car non traité sous 72h. Notre équipe vous contacte très prochainement.`
                ).catch(() => {});
            }
        }

        // Alerter l'admin
        notifyAdmin(`🚨 ${stale.length} litige(s) escaladé(s) automatiquement (>72h sans réponse) : ${stale.map(d => '#' + d.id.slice(0, 8)).join(', ')}`).catch(() => {});

        console.log(`[DISPUTE CRON] Escalated ${stale.length} stale dispute(s)`);
    } catch (err) {
        console.error('[DISPUTE CRON] Error:', err.message);
    }
}

export function startDisputeCron() {
    // Runs every hour at minute 0
    cron.schedule('0 * * * *', escalateStaleDisputes);
    console.log('✅ [CRON] Dispute auto-escalation scheduled (every hour)');
}
