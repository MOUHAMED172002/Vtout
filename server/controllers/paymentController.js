import { Order, FinancialTransaction, OrderItem, SellerBadgeSubscription, Supplier, Profile, Notification, PendingCheckout } from '../models/index.js';
import { verifyFedapayTransaction } from '../services/fedapayService.js';
import { sendOrderUpdateToCustomer, sendOrderNotificationToAdmin, sendInvoiceEmail } from '../services/mailService.js';
import { sendMetaCapiEvent } from '../services/metaCapiService.js';
import { materializePendingCheckout, releasePendingCheckoutReservation } from './orderController.js';
import crypto from 'crypto';

const activateSellerBadge = async (subscriptionId) => {
    const subscription = await SellerBadgeSubscription.findByPk(subscriptionId);
    if (!subscription || subscription.status === 'paid') return;

    await subscription.update({ status: 'paid' });

    const supplier = await Supplier.findByPk(subscription.supplier_id);
    if (!supplier) return;

    await supplier.update({
        is_certified: true,
        certified_badge_expires_at: subscription.period_end
    });

    if (supplier.user_id) {
        await Notification.create({
            id: crypto.randomUUID(),
            user_id: supplier.user_id,
            title: '✅ Badge Vendeur Certifié activé',
            message: `Votre paiement a été confirmé. Votre badge "Vendeur Certifié" est actif jusqu'au ${new Date(subscription.period_end).toLocaleDateString('fr-FR')}.`,
            type: 'success',
            is_read: false
        }).catch(() => {});
    }

    // Trace la recette pour l'admin dans le suivi financier existant
    try {
        const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
        let admin = await Profile.findOne({ where: { role: 'admin' } });
        if (!admin && adminEmails.length > 0) {
            const { Op } = await import('sequelize');
            admin = await Profile.findOne({ where: { email: { [Op.in]: adminEmails } } });
        }
        if (admin) {
            await FinancialTransaction.create({
                id: crypto.randomUUID(),
                user_id: admin.id,
                type: 'earning',
                source: 'seller_badge',
                amount: subscription.amount,
                description: `Abonnement Badge Certifié — ${supplier.name}`,
                status: 'completed'
            });
        }
    } catch (finErr) {
        console.warn('[Webhook] FinancialTransaction badge non créée:', finErr.message);
    }

    console.log(`[Webhook] Badge certifié activé pour le fournisseur ${supplier.id} jusqu'au ${subscription.period_end}`);
};

export const fedapayCallback = async (req, res) => {
    try {
        const { id, order_id } = req.query;
        // param 'id' vient de FedaPay (ID de transaction)

        if (!id || !order_id) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout/error`);
        }

        // On vérifie le statut réel via l'API FedaPay (sécurité)
        const fedaTx = await verifyFedapayTransaction(id);

        const firstId = order_id.split(',')[0].trim();

        // Nouveau flux différé (paiement en ligne) : order_id pointe en fait
        // vers un PendingCheckout tant que le paiement n'a jamais été
        // confirmé — aucune vraie commande n'existe encore à ce stade.
        const pending = await PendingCheckout.findByPk(firstId);
        if (pending) {
            const txPendingId = fedaTx.custom_metadata?.order_id || fedaTx.metadata?.order_id;
            if (txPendingId && !txPendingId.includes(firstId)) {
                console.error('[Payment Callback] FedaPay Transaction does not match pending checkout. Fraud attempt?');
                return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout/error?msg=SecurityError`);
            }

            if (fedaTx.status === 'approved') {
                const mainOrder = await materializePendingCheckout(pending.id);
                if (!mainOrder) {
                    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout/error?msg=OrderCreationFailed`);
                }
                return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout/success?order_id=${mainOrder.id}`);
            } else {
                // Paiement refusé/abandonné : rien à annuler, aucune commande
                // n'a jamais existé. La réservation de stock sera relâchée
                // immédiatement (au lieu d'attendre le cron d'expiration).
                if (pending.status === 'pending') {
                    await releasePendingCheckoutReservation(pending).catch(() => {});
                    await pending.update({ status: 'failed' }).catch(() => {});
                }
                return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout/error?msg=PaymentFailed`);
            }
        }

        // Flux legacy — commande déjà créée avant paiement (reversement cash,
        // ou toute commande issue d'avant ce changement d'architecture).
        const orderIds = order_id.split(',');
        const firstOrder = await Order.findByPk(firstId);
        if (!firstOrder) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout/error?msg=OrderNotFound`);
        }

        const txOrderId = fedaTx.custom_metadata?.order_id || fedaTx.metadata?.order_id;
        if (txOrderId && !txOrderId.includes(firstId)) {
            console.error('[Payment Callback] FedaPay Transaction does not match. Fraud attempt?');
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout/error?msg=SecurityError`);
        }

        if (fedaTx.status === 'approved') {
            for (const oId of orderIds) {
                await Order.update({ payment_status: 'payé' }, { where: { id: oId.trim() } });
            }
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout/success?order_id=${firstId}`);
        } else {
            for (const oId of orderIds) {
                await Order.update({ payment_status: 'echec' }, { where: { id: oId.trim() } });
            }
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout/error?msg=PaymentFailed`);
        }
    } catch (error) {
        console.error('[Payment Callback] Error:', error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout/error`);
    }
};

export const fedapayWebhook = async (req, res) => {
    try {
        // SECURITE : confirmé sur trafic réel — FedaPay envoie sa propre
        // signature dans l'en-tête "x-fedapay-signature", format
        // "t=<timestamp_unix>,s=<hmac_sha256_hex>" (le header personnalisé
        // "X-Webhook-Secret" configuré manuellement n'est lui-même jamais
        // envoyé). Hypothèse d'algorithme (à confirmer sur du trafic réel
        // avant de durcir en rejet strict) : signature = HMAC-SHA256(
        // FEDAPAY_WEBHOOK_SECRET, "{timestamp}.{corps brut}") — schéma
        // standard (Stripe et assimilés) que la doc FedaPay semble suivre.
        // ⚠️ Toujours en mode LOG SEULEMENT (jamais de rejet) tant qu'on n'a
        // pas confirmé au moins une correspondance "VALIDE" sur un vrai
        // paiement — sinon on risquerait de bloquer de vraies confirmations
        // sur une hypothèse d'algorithme encore non vérifiée.
        const sigHeader = req.headers['x-fedapay-signature'];
        let sigStatus = 'absent';
        if (sigHeader) {
            const parts = Object.fromEntries(String(sigHeader).split(',').map(p => p.split('=')));
            const { t: timestamp, s: providedSig } = parts;
            const webhookSecret = process.env.FEDAPAY_WEBHOOK_SECRET;
            if (webhookSecret && timestamp && providedSig && req.rawBody) {
                const expectedSig = crypto
                    .createHmac('sha256', webhookSecret)
                    .update(`${timestamp}.${req.rawBody.toString('utf8')}`)
                    .digest('hex');
                const expectedBuf = Buffer.from(expectedSig);
                const providedBuf = Buffer.from(providedSig);
                const matches = expectedBuf.length === providedBuf.length && crypto.timingSafeEqual(expectedBuf, providedBuf);
                sigStatus = matches ? 'VALIDE (hypothèse d\'algorithme confirmée !)' : `INVALIDE (calculé: ${expectedSig.slice(0, 12)}… reçu: ${providedSig.slice(0, 12)}…)`;
            } else {
                sigStatus = 'présent mais éléments manquants pour vérifier (secret/rawBody/parts)';
            }
        }
        console.log(`[FedaPay Webhook] Signature x-fedapay-signature: ${sigStatus}`);

        console.log('[FedaPay Webhook] Received:', req.body);

        // FedaPay envoie les événements webhook.
        const { event, entity } = req.body;

        if (event === 'transaction.approved' && entity) {
            // VERIFICATION DE SECURITE: Vérification API serveur-à-serveur
            let fedaTx;
            try {
                fedaTx = await verifyFedapayTransaction(entity.id);
            } catch (err) {
                console.error('[Webhook] Failed to verify transaction with FedaPay', err);
                return res.status(400).send('Transaction verification failed');
            }

            if (fedaTx.status !== 'approved') {
                 console.error('[Webhook] Transaction is not actually approved on FedaPay side.');
                 return res.status(400).send('Transaction not approved');
            }

            const orderIdStr = fedaTx.custom_metadata?.order_id || fedaTx.metadata?.order_id;
            const txType = fedaTx.custom_metadata?.type || fedaTx.metadata?.type;

            if (orderIdStr) {
                // Reversement cash livreur : on marque juste payment_status = 'payé'
                if (txType === 'reversement_cash') {
                    const order = await Order.findByPk(orderIdStr.trim());
                    if (order && order.payment_status !== 'payé') {
                        await order.update({ payment_status: 'payé' });
                        console.log(`[Webhook] Cash reversé pour commande ${orderIdStr}`);
                    }
                } else if (txType === 'seller_badge_subscription') {
                    // Abonnement badge "Vendeur Certifié" : pas de commande, on active le badge fournisseur
                    await activateSellerBadge(orderIdStr.trim());
                } else if (txType === 'pending_checkout') {
                    // Paiement client (flux différé) : la commande n'existe pas
                    // encore, on la matérialise maintenant — idempotent, peut
                    // arriver après (ou avant) le callback de redirection ou la
                    // confirmation explicite du widget pour le même paiement.
                    try {
                        const mainOrder = await materializePendingCheckout(orderIdStr.trim());
                        if (mainOrder) {
                            sendMetaCapiEvent({
                                eventName: 'Purchase',
                                eventSourceUrl: `${process.env.FRONTEND_URL || 'https://vtout.com'}/checkout/success`,
                                customData: { currency: 'XOF', value: parseFloat(mainOrder.total_amount || 0) }
                            }).catch(err => console.error('[CAPI Purchase]', err));
                        }
                    } catch (materializeErr) {
                        console.error('[Webhook] materializePendingCheckout failed:', materializeErr);
                    }
                } else {
                    // Paiement client classique
                    const orderIds = orderIdStr.split(',');
                    for (const oId of orderIds) {
                        const order = await Order.findByPk(oId.trim(), {
                            include: [{ model: OrderItem, as: 'items', include: ['product'] }]
                        });
                        if (order && order.payment_status !== 'payé') {
                            await order.update({ payment_status: 'payé' });
                            sendMetaCapiEvent({
                                eventName: 'Purchase',
                                eventSourceUrl: `${process.env.FRONTEND_URL || 'https://vtout.com'}/checkout/success`,
                                customData: { currency: 'XOF', value: parseFloat(order.total_amount || 0) }
                            }).catch(err => console.error('[CAPI Purchase]', err));
                            try {
                                await sendOrderUpdateToCustomer(order, 'Payé (En préparation)');
                                await sendOrderNotificationToAdmin(order);
                                await sendInvoiceEmail(order, order.items);
                            } catch (notifErr) {
                                console.error('[Webhook Notification Error]:', notifErr);
                            }
                        }
                    }
                }
            }
        }

        // Toujours retourner 200 pour dire à FedaPay qu'on a bien reçu
        res.status(200).send('Webhook received');
    } catch (error) {
        console.error('[FedaPay Webhook] Error:', error);
        // On retourne 200 quand même pour éviter que FedaPay ne spamme
        res.status(200).send('Error processed');
    }
};
