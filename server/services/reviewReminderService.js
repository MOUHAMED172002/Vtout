import { Order, Profile } from '../models/index.js';
import { sendWhatsAppMessage, getWhatsAppConfigs } from './whatsappService.js';
import { getTextTemplate } from './textTemplateService.js';
import { Op } from 'sequelize';

export const processReviewReminders = async () => {
    console.log('[ReviewReminder] Vérification des relances avis...');

    const { idInstance, apiToken, notifCustomer } = await getWhatsAppConfigs();
    if (!idInstance || !apiToken || idInstance.includes('XXXX') || !notifCustomer) {
        console.warn('[ReviewReminder] WhatsApp non configuré — ignoré.');
        return;
    }

    try {
        const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const orders = await Order.findAll({
            where: {
                status: { [Op.in]: ['livrée', 'livree'] },
                delivered_at: { [Op.between]: [thirtyDaysAgo, twoDaysAgo] },
                review_reminder_sent_at: null,
                user_id: { [Op.ne]: null }
            },
            include: [{ model: Profile, as: 'user', attributes: ['fullname', 'phone'] }]
        });

        console.log(`[ReviewReminder] ${orders.length} commande(s) éligibles.`);

        for (const order of orders) {
            const phone = order.user?.phone;
            if (!phone) continue;

            const clientName = order.user?.fullname || 'cher client';
            const defaultMsg = `⭐ *VTOUT : Donnez votre avis !*\n\nBonjour {{clientName}},\n\nVotre commande #{{orderId}} a bien été livrée. Nous espérons que vous êtes satisfait(e) !\n\nVotre avis nous aide à améliorer notre service.\n\n🔗 https://vtout.com/user/dashboard/orders`;

            const message = await getTextTemplate('whatsapp_review_request', defaultMsg, {
                clientName,
                orderId: order.id.slice(0, 8)
            });

            const result = await sendWhatsAppMessage(phone, message);
            if (result?.success) {
                await order.update({ review_reminder_sent_at: new Date() });
                console.log(`[ReviewReminder] Avis envoyé pour commande ${order.id.slice(0, 8)} → ${phone}`);
            }
        }
    } catch (error) {
        console.error('[ReviewReminder] Erreur:', error);
    }
};
