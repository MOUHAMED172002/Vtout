import crypto from 'crypto';
import { Dispute, Profile, Supplier, Order, Notification, FinancialTransaction } from '../models/index.js';
import { notifyAdmin, sendWhatsAppMessage } from '../services/whatsappService.js';

export const getAllDisputes = async (req, res) => {
    try {
        const disputes = await Dispute.findAll({
            include: [
                { model: Profile, as: 'user', attributes: ['fullname', 'email', 'phone'] },
                { model: Supplier, as: 'supplier', attributes: ['name', 'email', 'whatsapp'] },
                { model: Order, as: 'order' }
            ],
            order: [['created_at', 'DESC']]
        });
        res.json(disputes);
    } catch (error) {
        console.error('Error fetching disputes:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const updateDisputeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, resolution, action } = req.body;

        const dispute = await Dispute.findByPk(id, {
            include: [
                { model: Profile, as: 'user', attributes: ['fullname', 'phone'] },
                { model: Order, as: 'order' }
            ]
        });
        if (!dispute) return res.status(404).json({ error: 'Dispute not found' });

        dispute.status = status;
        if (resolution) dispute.resolution = resolution;
        if (status === 'resolved' || status === 'cancelled') {
            dispute.resolved_at = new Date();
        }
        await dispute.save();

        // Update order dispute_status accordingly
        if (dispute.order) {
            const orderDisputeMap = { resolved: 'resolu', cancelled: 'annule', under_review: 'en_cours' };
            if (orderDisputeMap[status]) {
                await dispute.order.update({ dispute_status: orderDisputeMap[status] });
            }
        }

        // Notification in-app au client
        const notifMessages = {
            resolved: `✅ Votre litige #${id.slice(0, 8)} a été résolu. ${resolution || ''}`,
            cancelled: `❌ Votre litige #${id.slice(0, 8)} a été annulé. ${resolution || ''}`,
            under_review: `🔍 Votre litige #${id.slice(0, 8)} est en cours d'examen par notre équipe.`,
        };
        if (notifMessages[status] && dispute.user_id) {
            await Notification.create({
                id: crypto.randomUUID(),
                user_id: dispute.user_id,
                title: status === 'resolved' ? '✅ Litige résolu' : status === 'cancelled' ? '❌ Litige annulé' : '🔍 Litige en cours d\'examen',
                message: notifMessages[status],
                type: 'info',
                is_read: false,
            }).catch(() => {});

            // WhatsApp au client si numéro disponible
            const clientPhone = dispute.user?.phone;
            if (clientPhone) {
                sendWhatsAppMessage(clientPhone, notifMessages[status]).catch(() => {});
            }
        }

        // Remboursement automatique si action = 'refund'
        if (action === 'refund' && dispute.order) {
            const refundAmount = parseFloat(dispute.order.total_amount || 0);
            if (refundAmount > 0 && dispute.user_id) {
                // 1. Annuler tous les gains (fournisseur, livreur, admin) liés à cette commande
                await FinancialTransaction.update(
                    { status: 'cancelled' },
                    { where: { order_id: dispute.order_id, type: 'earning', status: 'completed' } }
                );

                // 2. Créer la transaction de remboursement client
                //    type='adjustment' car 'refund' n'est pas dans l'ENUM
                await FinancialTransaction.create({
                    id: crypto.randomUUID(),
                    user_id: dispute.user_id,
                    order_id: dispute.order_id,
                    amount: refundAmount,
                    type: 'adjustment',
                    source: 'dispute_refund',
                    description: `Remboursement litige #${id.slice(0, 8)} — ${resolution || 'Décision admin'}`,
                    status: 'completed',
                });

                await Notification.create({
                    id: crypto.randomUUID(),
                    user_id: dispute.user_id,
                    title: '💸 Remboursement effectué',
                    message: `Un remboursement de ${refundAmount.toLocaleString()} F a été crédité sur votre compte pour le litige #${id.slice(0, 8)}.`,
                    type: 'success',
                    is_read: false,
                }).catch(() => {});
            }
        }

        notifyAdmin(`📋 Litige #${id.slice(0, 8)} → ${status}${action === 'refund' ? ' + REMBOURSEMENT' : ''}`).catch(() => {});

        res.json(dispute);
    } catch (error) {
        console.error('Error updating dispute:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const createDispute = async (req, res) => {
    try {
        const { order_id, motif, reason, description, photo_url } = req.body;
        const userId = req.auth?.userId;

        if (!userId) return res.status(401).json({ error: 'Auth required' });

        const order = await Order.findByPk(order_id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        if (order.user_id !== userId) return res.status(403).json({ error: 'Access denied' });

        const dispute = await Dispute.create({
            id: crypto.randomUUID(),
            order_id,
            user_id: userId,
            supplier_id: order.supplier_id,
            motif: motif || null,
            reason: motif || reason || 'Problème signalé par le client',
            description: description || null,
            photo_url: photo_url || null,
            status: 'open'
        });

        await order.update({ dispute_status: 'ouvert' });
        res.status(201).json(dispute);
    } catch (error) {
        console.error('Error creating dispute:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
