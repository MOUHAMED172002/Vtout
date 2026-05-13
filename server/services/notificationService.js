
import { Order, Boutique, Supplier, Profile } from '../models/index.js';
import { Op } from 'sequelize';
import { notifySupplierOfNewOrder, notifyAdmin } from './whatsappService.js';

/**
 * findStuckOrders - Identifie les commandes en attente depuis trop longtemps
 * et renvoie des rappels aux boutiques.
 */
export const checkAndRemindStuckOrders = async (hours = 2) => {
    try {
        const threshold = new Date(new Date() - hours * 60 * 60 * 1000);
        
        const stuckOrders = await Order.findAll({
            where: {
                status: 'en_attente',
                created_at: { [Op.lt]: threshold }
            },
            include: [{ 
                model: Boutique, 
                as: 'boutique',
                include: [{ model: Supplier, as: 'supplier', include: [{ model: Profile, as: 'profile' }] }]
            }]
        });

        console.log(`[Reminder] Found ${stuckOrders.length} stuck orders.`);

        for (const order of stuckOrders) {
            const targetPhone = order.boutique?.whatsapp || order.boutique?.phone || order.boutique?.supplier?.whatsapp || order.boutique?.supplier?.profile?.phone;
            
            if (targetPhone) {
                console.log(`[Reminder] Notifying ${targetPhone} for order ${order.id}`);
                await notifySupplierOfNewOrder(targetPhone, order.id, order.total_amount, true); // true for reminder
            }
        }

        if (stuckOrders.length > 0) {
            await notifyAdmin(`🔔 RAPPEL : ${stuckOrders.length} commandes sont en attente depuis plus de ${hours}h.`);
        }

        return stuckOrders.length;
    } catch (error) {
        console.error("[Reminder Error]:", error);
        return 0;
    }
};
