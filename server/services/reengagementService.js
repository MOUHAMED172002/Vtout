import { Order, Profile } from '../models/index.js';
import { sendWhatsAppMessage, getWhatsAppConfigs } from './whatsappService.js';
import { getTextTemplate, getTextConfig } from './textTemplateService.js';
import { Op } from 'sequelize';

export const processReengagement = async () => {
    console.log('[Reengagement] Vérification des clients inactifs...');

    const { idInstance, apiToken, notifCustomer } = await getWhatsAppConfigs();
    if (!idInstance || !apiToken || idInstance.includes('XXXX') || !notifCustomer) {
        console.warn('[Reengagement] WhatsApp non configuré — ignoré.');
        return;
    }

    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const profiles = await Profile.findAll({
            where: {
                phone: { [Op.ne]: null },
                [Op.or]: [
                    { last_reengagement_at: null },
                    { last_reengagement_at: { [Op.lt]: thirtyDaysAgo } }
                ]
            }
        });

        console.log(`[Reengagement] ${profiles.length} profils candidats.`);

        const defaultMsg = `🛍️ *VTOUT : On pense à vous !*\n\nBonjour {{clientName}},\n\nCela fait un moment qu'on ne vous a pas vu sur Vtout !\n\nDécouvrez les nouveautés et profitez d'une livraison rapide dans tout le Bénin.\n\n🔗 https://vtout.com`;

        for (const profile of profiles) {
            const recentOrder = await Order.findOne({
                where: {
                    user_id: profile.id,
                    created_at: { [Op.gte]: thirtyDaysAgo }
                }
            });

            if (recentOrder) continue;

            const clientName = profile.fullname || profile.first_name || 'cher client';
            const message = await getTextTemplate('whatsapp_reengagement', defaultMsg, { clientName });

            const result = await sendWhatsAppMessage(profile.phone, message);
            if (result?.success) {
                await profile.update({ last_reengagement_at: new Date() });
                console.log(`[Reengagement] Message envoyé → ${profile.phone}`);
            }
        }
    } catch (error) {
        console.error('[Reengagement] Erreur:', error);
    }
};

export const processVipMessages = async () => {
    console.log('[VIP] Vérification des meilleurs clients...');

    const { idInstance, apiToken, notifCustomer } = await getWhatsAppConfigs();
    if (!idInstance || !apiToken || idInstance.includes('XXXX') || !notifCustomer) {
        console.warn('[VIP] WhatsApp non configuré — ignoré.');
        return;
    }

    try {
        const thresholdStr = await getTextConfig('vip_customer_threshold', '5', 'marketplace');
        const threshold = parseInt(thresholdStr, 10) || 5;

        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const profiles = await Profile.findAll({
            where: {
                phone: { [Op.ne]: null },
                [Op.or]: [
                    { last_vip_message_at: null },
                    { last_vip_message_at: { [Op.lt]: thirtyDaysAgo } }
                ]
            }
        });

        console.log(`[VIP] ${profiles.length} profils candidats.`);

        const defaultMsg = `⭐ *VTOUT : Merci, client VIP !*\n\nBonjour {{clientName}},\n\nVous faites partie de nos meilleurs clients avec *{{orderCount}} commandes* passées !\n\nVotre fidélité nous touche énormément.\n\n🎁 Des offres exclusives vous attendent sur :\n🔗 https://vtout.com`;

        for (const profile of profiles) {
            const orderCount = await Order.count({
                where: {
                    user_id: profile.id,
                    status: { [Op.in]: ['livrée', 'livree'] }
                }
            });

            if (orderCount < threshold) continue;

            const clientName = profile.fullname || profile.first_name || 'cher client';
            const message = await getTextTemplate('whatsapp_vip_customer', defaultMsg, { clientName, orderCount });

            const result = await sendWhatsAppMessage(profile.phone, message);
            if (result?.success) {
                await profile.update({ last_vip_message_at: new Date() });
                console.log(`[VIP] Message envoyé à ${profile.phone} (${orderCount} commandes)`);
            }
        }
    } catch (error) {
        console.error('[VIP] Erreur:', error);
    }
};
