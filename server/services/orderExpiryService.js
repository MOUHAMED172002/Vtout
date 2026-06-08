import { Op } from 'sequelize';
import { Order, OrderItem, Product, ProductVariant, Profile } from '../models/index.js';
import { notifyCustomerOfStatusUpdate } from './whatsappService.js';

const EXPIRY_HOURS = 48;

export async function expireStaleOrders() {
    const cutoff = new Date(Date.now() - EXPIRY_HOURS * 60 * 60 * 1000);

    const staleOrders = await Order.findAll({
        where: { status: 'en_attente', created_at: { [Op.lt]: cutoff } },
        include: [{ model: OrderItem, as: 'items' }]
    });

    for (const order of staleOrders) {
        // Restore stock
        for (const item of (order.items || [])) {
            if (item.variant_id) {
                await ProductVariant.increment('stock', { by: item.quantity, where: { id: item.variant_id } });
            } else if (item.product_id) {
                await Product.increment('stock', { by: item.quantity, where: { id: item.product_id } });
            }
        }

        let history = order.status_history || [];
        if (typeof history === 'string') try { history = JSON.parse(history); } catch { history = []; }
        history.push({ status: 'annulée', date: new Date(), reason: 'expiration_automatique' });

        await order.update({ status: 'annulée', status_history: history });

        // Notify customer
        const customerPhone = order.whatsapp_notif_phone || order.guest_phone;
        if (customerPhone) {
            notifyCustomerOfStatusUpdate(customerPhone, order.id, 'annulée').catch(() => {});
        } else if (order.user_id) {
            Profile.findByPk(order.user_id).then(p => {
                if (p?.phone) notifyCustomerOfStatusUpdate(p.phone, order.id, 'annulée').catch(() => {});
            }).catch(() => {});
        }
    }

    if (staleOrders.length > 0) {
        console.log(`[ORDER EXPIRY] ${staleOrders.length} commande(s) expirée(s) automatiquement après ${EXPIRY_HOURS}h`);
    }
}
