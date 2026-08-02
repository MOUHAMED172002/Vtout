import cron from 'node-cron';
import { Op } from 'sequelize';
import crypto from 'crypto';
import { Supplier, Notification } from '../models/index.js';
import { notifyAdmin } from './whatsappService.js';

async function expireStaleCertifications() {
    try {
        const expired = await Supplier.findAll({
            where: {
                is_certified: true,
                certified_badge_expires_at: { [Op.lt]: new Date() }
            }
        });

        if (expired.length === 0) return;

        for (const supplier of expired) {
            await supplier.update({ is_certified: false });

            if (supplier.user_id) {
                await Notification.create({
                    id: crypto.randomUUID(),
                    user_id: supplier.user_id,
                    title: '⚠️ Badge Vendeur Certifié expiré',
                    message: 'Votre abonnement au badge "Vendeur Certifié" a expiré. Renouvelez-le pour continuer à afficher le badge sur vos produits.',
                    type: 'warning',
                    is_read: false
                }).catch(() => {});
            }
        }

        notifyAdmin(`ℹ️ ${expired.length} badge(s) "Vendeur Certifié" expiré(s) et désactivé(s) automatiquement.`).catch(() => {});

        console.log(`[BADGE CRON] Expired ${expired.length} seller badge(s)`);
    } catch (err) {
        console.error('[BADGE CRON] Error:', err.message);
    }
}

export function startSellerBadgeCron() {
    // Runs every hour at minute 15
    cron.schedule('15 * * * *', expireStaleCertifications);
    console.log('✅ [CRON] Seller badge expiration scheduled (every hour)');
}
