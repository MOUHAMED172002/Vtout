import { Order, FinancialTransaction, OrderItem } from '../models/index.js';
import { verifyFedapayTransaction } from '../services/fedapayService.js';
import { sendOrderUpdateToCustomer, sendOrderNotificationToAdmin, sendInvoiceEmail } from '../services/mailService.js';
import { sendMetaCapiEvent } from '../services/metaCapiService.js';
import crypto from 'crypto';

export const fedapayCallback = async (req, res) => {
    try {
        const { id, status, order_id } = req.query;
        // param 'id' vient de FedaPay (ID de transaction)
        
        if (!id || !order_id) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout/error`);
        }

        // On vérifie le statut réel via l'API FedaPay (sécurité)
        const fedaTx = await verifyFedapayTransaction(id);
        
        // order_id can contain multiple IDs separated by commas
        const orderIds = order_id.split(',');
        const firstOrderId = orderIds[0].trim();
        
        const firstOrder = await Order.findByPk(firstOrderId);
        if (!firstOrder) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout/error?msg=OrderNotFound`);
        }
 
        // Security check
        const txOrderId = fedaTx.custom_metadata?.order_id || fedaTx.metadata?.order_id;
        if (txOrderId && !txOrderId.includes(firstOrderId)) {
            console.error('[Payment Callback] FedaPay Transaction does not match. Fraud attempt?');
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout/error?msg=SecurityError`);
        }
 
        if (fedaTx.status === 'approved') {
            // Update all linked orders
            for (const oId of orderIds) {
                await Order.update({ payment_status: 'payé' }, { where: { id: oId.trim() } });
            }
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout/success?order_id=${firstOrderId}`);
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
