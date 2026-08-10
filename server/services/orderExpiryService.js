import { Op } from 'sequelize';
import { Order, OrderItem, Product, ProductVariantPrice, Profile } from '../models/index.js';
import { notifyCustomerOfStatusUpdate, sendWhatsAppMessage } from './whatsappService.js';

const EXPIRY_HOURS = 48;

// Délai spécifique au paiement en ligne : bien plus court que le nettoyage
// générique 48h ci-dessus. Un client qui n'a pas finalisé son paiement
// FedaPay ne va pas revenir des heures après — on libère le stock vite,
// et la commande n'apparaît jamais comme "vraie" commande en attente côté
// admin/livreur si le paiement n'a jamais abouti.
const ONLINE_PAYMENT_TIMEOUT_MINUTES = 30;
const ONLINE_PAYMENT_METHODS = ['fedapay', 'mobile_money', 'card'];

export async function expireStaleOrders() {
    const cutoff = new Date(Date.now() - EXPIRY_HOURS * 60 * 60 * 1000);

    const staleOrders = await Order.findAll({
        where: { status: 'en_attente', created_at: { [Op.lt]: cutoff } },
        include: [{ model: OrderItem, as: 'items' }]
    });

    for (const order of staleOrders) {
        // Ces commandes sont toujours 'en_attente' (jamais livrées) — le stock
        // physique réel n'a jamais été touché, seule la réservation doit être
        // relâchée. Corrige au passage un bug pré-existant : ProductVariant n'a
        // pas de colonne stock (c'est ProductVariantPrice qui la porte), donc
        // cet appel ne mettait jamais rien à jour pour les produits à variantes.
        for (const item of (order.items || [])) {
            if (item.variant_id) {
                await ProductVariantPrice.decrement('reserved_stock', { by: item.quantity, where: { variant_id: item.variant_id } });
            } else if (item.product_id) {
                await Product.decrement('reserved_stock', { by: item.quantity, where: { id: item.product_id } });
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

// Annule les commandes payées en ligne (FedaPay, mobile money, carte) dont
// le paiement n'a jamais été confirmé après ONLINE_PAYMENT_TIMEOUT_MINUTES —
// distinct du nettoyage générique ci-dessus (48h, tous modes de paiement
// confondus), car un paiement en ligne abandonné doit libérer le stock bien
// plus vite qu'une commande "paiement à la livraison" en attente d'un livreur.
export async function expireUnpaidOnlinePayments() {
    const cutoff = new Date(Date.now() - ONLINE_PAYMENT_TIMEOUT_MINUTES * 60 * 1000);

    const unpaidOrders = await Order.findAll({
        where: {
            status: 'en_attente',
            payment_status: { [Op.in]: ['en_attente', 'non_payé'] },
            payment_method: { [Op.in]: ONLINE_PAYMENT_METHODS },
            created_at: { [Op.lt]: cutoff }
        },
        include: [{ model: OrderItem, as: 'items' }]
    });

    for (const order of unpaidOrders) {
        // Toujours 'en_attente' (voir requête ci-dessus) — même logique que
        // expireStaleOrders : on relâche la réservation, le stock réel n'a
        // jamais été décrémenté pour ces commandes.
        for (const item of (order.items || [])) {
            if (item.variant_id) {
                await ProductVariantPrice.decrement('reserved_stock', { by: item.quantity, where: { variant_id: item.variant_id } });
            } else if (item.product_id) {
                await Product.decrement('reserved_stock', { by: item.quantity, where: { id: item.product_id } });
            }
        }

        let history = order.status_history || [];
        if (typeof history === 'string') try { history = JSON.parse(history); } catch { history = []; }
        history.push({ status: 'annulée', date: new Date(), reason: 'paiement_en_ligne_non_confirme' });

        await order.update({ status: 'annulée', payment_status: 'non_payé', status_history: history });

        // Message dédié (pas notifyCustomerOfStatusUpdate) pour expliquer la
        // vraie raison — "annulée" tout court laisserait croire à une
        // décision du vendeur, alors qu'ici c'est simplement le paiement
        // qui n'a jamais été confirmé à temps.
        const reasonMessage = `📦 *VTOUT : Commande annulée*\nVotre commande #${order.id.slice(0, 8).toUpperCase()} a été annulée car le paiement n'a pas été confirmé à temps. Vous pouvez recommander à tout moment.`;
        const customerPhone = order.whatsapp_notif_phone || order.guest_phone;
        if (customerPhone) {
            sendWhatsAppMessage(customerPhone, reasonMessage).catch(() => {});
        } else if (order.user_id) {
            Profile.findByPk(order.user_id).then(p => {
                if (p?.phone) sendWhatsAppMessage(p.phone, reasonMessage).catch(() => {});
            }).catch(() => {});
        }
    }

    if (unpaidOrders.length > 0) {
        console.log(`[ORDER EXPIRY] ${unpaidOrders.length} commande(s) paiement en ligne annulée(s) automatiquement après ${ONLINE_PAYMENT_TIMEOUT_MINUTES}min sans confirmation`);
    }
}
