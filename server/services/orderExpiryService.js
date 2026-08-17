import { Op } from 'sequelize';
import { Order, OrderItem, Product, ProductVariantPrice, Profile, PendingCheckout } from '../models/index.js';
import { notifyCustomerOfStatusUpdate, sendWhatsAppMessage } from './whatsappService.js';
import { sendOrderUpdateToCustomer } from './mailService.js';
import { releasePendingCheckoutReservation } from '../controllers/orderController.js';

const EXPIRY_HOURS = 48;

// Délai spécifique au paiement en ligne : bien plus court que le nettoyage
// générique 48h ci-dessus. Un client qui n'a pas finalisé son paiement
// FedaPay ne va pas revenir des heures après — on libère le stock vite,
// et la commande n'apparaît jamais comme "vraie" commande en attente côté
// admin/livreur si le paiement n'a jamais abouti.
const ONLINE_PAYMENT_TIMEOUT_MINUTES = 30;

// Délai de la relance mi-fenêtre — assez tôt pour laisser le temps de finir
// le paiement avant expiration (30min), assez tard pour ne pas relancer un
// client qui était juste en train de payer normalement.
const REMINDER_DELAY_MINUTES = 15;

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

        // Notify customer — email de secours (fallbackEmail) si WhatsApp
        // échoue, pour ne pas laisser le client sans nouvelle en cas de
        // panne WhatChimp/hors fenêtre de session 24h.
        let customerPhone = order.whatsapp_notif_phone || order.guest_phone;
        let customerEmail = order.guest_email || null;
        if ((!customerPhone || !customerEmail) && order.user_id) {
            try {
                const p = await Profile.findByPk(order.user_id);
                if (!customerPhone) customerPhone = p?.phone || null;
                if (!customerEmail) customerEmail = p?.email || null;
            } catch { /* ignore */ }
        }
        if (customerPhone) {
            notifyCustomerOfStatusUpdate(customerPhone, order.id, 'annulée', customerEmail).catch(() => {});
        } else if (customerEmail) {
            // Aucun téléphone connu du tout — email direct, seul canal possible.
            sendOrderUpdateToCustomer({ id: order.id, guest_email: customerEmail }, 'Annulée').catch(() => {});
        }
    }

    if (staleOrders.length > 0) {
        console.log(`[ORDER EXPIRY] ${staleOrders.length} commande(s) expirée(s) automatiquement après ${EXPIRY_HOURS}h`);
    }
}

// Expire les tentatives de paiement en ligne (FedaPay, mobile money, carte)
// jamais confirmées après ONLINE_PAYMENT_TIMEOUT_MINUTES. Depuis le passage
// à la création de commande DIFFÉRÉE jusqu'à confirmation du paiement (voir
// orderController.js createOrder/materializePendingCheckout), il n'y a plus
// de commande à annuler ici — seulement un PendingCheckout à expirer et sa
// réservation de stock à relâcher. Le panier du client n'a jamais été vidé
// pour une tentative non aboutie, donc il peut simplement recommencer le
// checkout sans rien perdre.
export async function expirePendingCheckouts() {
    const cutoff = new Date(Date.now() - ONLINE_PAYMENT_TIMEOUT_MINUTES * 60 * 1000);

    const staleCheckouts = await PendingCheckout.findAll({
        where: { status: 'pending', created_at: { [Op.lt]: cutoff } }
    });

    for (const pending of staleCheckouts) {
        await releasePendingCheckoutReservation(pending);
        await pending.update({ status: 'expired' });

        try {
            const payload = JSON.parse(pending.payload);
            const bo = payload.boutiqueOrders?.[0];
            if (!bo) continue;

            const reasonMessage = `📦 *VTOUT : Paiement expiré*\nVotre tentative de paiement n'a pas été confirmée à temps. Votre panier est toujours disponible, vous pouvez réessayer quand vous voulez.`;
            let customerPhone = bo.whatsapp_notif_phone || bo.guest_phone;
            let customerEmail = bo.guest_email || null;
            if ((!customerPhone || !customerEmail) && bo.user_id) {
                try {
                    const p = await Profile.findByPk(bo.user_id);
                    if (!customerPhone) customerPhone = p?.phone || null;
                    if (!customerEmail) customerEmail = p?.email || null;
                } catch { /* ignore */ }
            }
            const emailFallback = async () => {
                if (!customerEmail) return;
                try {
                    await sendOrderUpdateToCustomer({ id: pending.id, guest_email: customerEmail }, 'Paiement expiré');
                } catch (mailErr) {
                    console.error('[Notif Fallback] Email de secours échoué:', mailErr);
                }
            };
            if (customerPhone) {
                sendWhatsAppMessage(customerPhone, reasonMessage).then(r => {
                    if (!r?.success) emailFallback();
                }).catch(() => emailFallback());
            } else {
                emailFallback();
            }
        } catch (notifErr) {
            console.error('[ORDER EXPIRY] Notification échec expiration pending checkout:', notifErr);
        }
    }

    if (staleCheckouts.length > 0) {
        console.log(`[ORDER EXPIRY] ${staleCheckouts.length} tentative(s) de paiement en ligne expirée(s) automatiquement après ${ONLINE_PAYMENT_TIMEOUT_MINUTES}min sans confirmation`);
    }
}

// Relance mi-fenêtre pour un paiement en ligne initié mais pas encore
// confirmé — jusqu'ici le client n'avait AUCUNE nouvelle avant l'expiration
// à 30min (voir expirePendingCheckouts ci-dessus), ce qui laissait passer
// des paiements simplement abandonnés en cours de route (onglet fermé,
// distraction…) qui auraient pu être finalisés avec un simple rappel.
// reminder_sent_at empêche de relancer plusieurs fois au fil des passages
// du cron. Contient un lien direct vers la page de reprise du paiement
// (PendingPaymentPage.jsx côté frontend), qui réutilise RetryPaymentButton
// pour régénérer une transaction FedaPay sans perdre la réservation de stock.
export async function remindPendingCheckouts() {
    const cutoff = new Date(Date.now() - REMINDER_DELAY_MINUTES * 60 * 1000);

    const dueCheckouts = await PendingCheckout.findAll({
        where: {
            status: 'pending',
            reminder_sent_at: null,
            created_at: { [Op.lt]: cutoff }
        }
    });

    let sent = 0;
    for (const pending of dueCheckouts) {
        try {
            const payload = JSON.parse(pending.payload);
            const bo = payload.boutiqueOrders?.[0];
            if (!bo) continue;

            const link = `${process.env.FRONTEND_URL || 'https://vtout.com'}/paiement-en-attente/${pending.id}`;
            const remainingMinutes = ONLINE_PAYMENT_TIMEOUT_MINUTES - REMINDER_DELAY_MINUTES;
            const reminderMessage = `⏳ *VTOUT : Paiement en attente*\nVotre commande n'est pas encore finalisée — il vous reste environ ${remainingMinutes} minutes pour terminer le paiement avant que votre réservation ne soit relâchée.\n\n👉 ${link}`;

            let customerPhone = bo.whatsapp_notif_phone || bo.guest_phone;
            let customerEmail = bo.guest_email || null;
            if ((!customerPhone || !customerEmail) && bo.user_id) {
                try {
                    const p = await Profile.findByPk(bo.user_id);
                    if (!customerPhone) customerPhone = p?.phone || null;
                    if (!customerEmail) customerEmail = p?.email || null;
                } catch { /* ignore */ }
            }

            const emailFallback = async () => {
                if (!customerEmail) return;
                try {
                    await sendOrderUpdateToCustomer({ id: pending.id, guest_email: customerEmail }, `En attente — ${link}`);
                } catch (mailErr) {
                    console.error('[Notif Fallback] Email de secours échoué:', mailErr);
                }
            };

            if (customerPhone) {
                sendWhatsAppMessage(customerPhone, reminderMessage).then(r => {
                    if (!r?.success) emailFallback();
                }).catch(() => emailFallback());
            } else {
                emailFallback();
            }

            // Marqué relancé qu'un contact ait été trouvé ou non — sans
            // téléphone ni email, aucune relance ultérieure ne fera mieux, et
            // on ne veut pas retenter indéfiniment un checkout sans contact.
            await pending.update({ reminder_sent_at: new Date() });
            sent++;
        } catch (err) {
            console.error('[ORDER EXPIRY] Relance paiement en attente échouée:', err);
        }
    }

    if (sent > 0) {
        console.log(`[ORDER EXPIRY] ${sent} relance(s) de paiement en attente envoyée(s)`);
    }
}
