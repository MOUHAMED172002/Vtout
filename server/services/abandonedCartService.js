import { Profile, Cart, Product } from '../models/index.js';
import { sendWhatsAppMessage, getWhatsAppConfigs } from './whatsappService.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Service pour gérer la relance des paniers abandonnés via WhatsApp
 */
export const processAbandonedCarts = async () => {
    console.log('[AbandonedCart] Démarrage de la vérification...');

    const { idInstance, apiToken } = await getWhatsAppConfigs();
    if (!idInstance || !apiToken || idInstance.includes('XXXX')) {
        console.warn('[AbandonedCart] WhatsApp non configuré — relances ignorées.');
        return;
    }

    try {
        const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Trouver les profils qui ont des articles dans leur panier
        // et qui n'ont pas été relancés dans les dernières 24h
        const profilesWithCarts = await Profile.findAll({
            where: {
                phone: { [Op.ne]: null },
                [Op.or]: [
                    { last_abandoned_reminder_at: null },
                    { last_abandoned_reminder_at: { [Op.lt]: twentyFourHoursAgo } }
                ]
            },
            include: [{
                model: Cart,
                as: 'cartItems',
                required: true,
                include: [{ model: Product, as: 'product' }]
            }]
        });

        console.log(`[AbandonedCart] ${profilesWithCarts.length} utilisateurs potentiels trouvés.`);

        for (const profile of profilesWithCarts) {
            // Vérifier si le panier est "vieux" (au moins 6h depuis le dernier ajout)
            const newestItem = profile.cartItems.reduce((prev, current) => 
                (prev.updatedAt > current.updatedAt) ? prev : current
            );

            if (newestItem.updatedAt < sixHoursAgo) {
                await sendReminder(profile);
            }
        }
    } catch (error) {
        console.error('[AbandonedCart] Erreur lors du process:', error);
    }
};

const sendReminder = async (profile) => {
    try {
        const itemCount = profile.cartItems.length;
        const firstItemName = profile.cartItems[0]?.product?.name || 'articles';
        const totalAmount = profile.cartItems.reduce((sum, item) => sum + (parseFloat(item.price_snapshot || 0) * item.quantity), 0);
        
        let message = `🛒 *VTOUT : Votre panier vous attend !*\n\nBonjour ${profile.fullname || profile.first_name || 'cher client'},\n\nVous avez laissé ${itemCount} article(s) dans votre panier, dont *${firstItemName}*.\n`;
        
        if (totalAmount > 0) {
            message += `Montant total : *${totalAmount.toLocaleString()} F*\n`;
        }

        message += `\nNe laissez pas vos articles s'envoler ! Complétez votre commande dès maintenant sur Vtout.\n\n🔗 https://vtout.com/user/dashboard/cart`;

        console.log(`[AbandonedCart] Envoi de relance à ${profile.phone} (${profile.fullname})`);
        const result = await sendWhatsAppMessage(profile.phone, message);

        if (result.success) {
            await profile.update({ last_abandoned_reminder_at: new Date() });
            console.log(`[AbandonedCart] Relance réussie pour ${profile.phone}`);
        } else {
            console.error(`[AbandonedCart] Échec envoi WhatsApp à ${profile.phone}:`, result.error);
        }
    } catch (error) {
        console.error(`[AbandonedCart] Erreur envoi reminder pour ${profile.id}:`, error.message);
    }
};
