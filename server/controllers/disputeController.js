import crypto from 'crypto';
import { Op } from 'sequelize';
import { Dispute, Profile, Supplier, Boutique, Order, Notification, FinancialTransaction } from '../models/index.js';
import sequelize from '../config/database.js';
import { notifyAdmin, sendWhatsAppMessage } from '../services/whatsappService.js';

const warnWA = (err) => console.error('[WhatsApp dispute]', err?.message || err);

// ── Internal helper: auto-close disputes resolved > 7 days ago ──────────────
const autoCloseStaleResolutions = async () => {
    try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const stale = await Dispute.findAll({
            where: {
                status: 'resolved',
                resolved_at: { [Op.lt]: sevenDaysAgo }
            },
            include: [{ model: Order, as: 'order' }]
        });

        if (stale.length === 0) return;

        for (const dispute of stale) {
            if (dispute.order) {
                await dispute.order.update({ dispute_status: 'resolu' }).catch(() => {});
            }
        }

        console.log(`[AutoClose] ${stale.length} litiges clôturés automatiquement`);
    } catch (err) {
        console.error('[AutoClose] Erreur:', err.message);
    }
};

export const getAllDisputes = async (req, res) => {
    try {
        // Lazy auto-close stale resolutions
        autoCloseStaleResolutions().catch(() => {});

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

export const getDisputeStats = async (req, res) => {
    try {
        const allDisputes = await Dispute.findAll({
            attributes: ['status', 'motif', 'resolved_at', 'created_at', 'refund_amount']
        });

        const total = allDisputes.length;

        const byStatus = { open: 0, under_review: 0, resolved: 0, cancelled: 0 };
        let totalResolutionHours = 0;
        let resolvedCount = 0;
        let refundedCount = 0;
        const motifCounts = {};

        for (const d of allDisputes) {
            if (byStatus[d.status] !== undefined) byStatus[d.status]++;

            if (d.status === 'resolved' && d.resolved_at && d.created_at) {
                const diffMs = new Date(d.resolved_at) - new Date(d.created_at);
                totalResolutionHours += diffMs / (1000 * 60 * 60);
                resolvedCount++;
            }

            if (d.refund_amount && parseFloat(d.refund_amount) > 0) {
                refundedCount++;
            }

            if (d.motif) {
                motifCounts[d.motif] = (motifCounts[d.motif] || 0) + 1;
            }
        }

        const avgResolutionHours = resolvedCount > 0
            ? Math.round((totalResolutionHours / resolvedCount) * 10) / 10
            : 0;

        const topMotifs = Object.entries(motifCounts)
            .map(([motif, count]) => ({ motif, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        res.json({
            total,
            byStatus,
            avgResolutionHours,
            topMotifs,
            openRate: total > 0 ? Math.round((byStatus.open / total) * 100) / 100 : 0,
            refundRate: total > 0 ? Math.round((refundedCount / total) * 100) / 100 : 0
        });
    } catch (error) {
        console.error('Error fetching dispute stats:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const updateDisputeStatus = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { status, resolution, action, refund_amount, admin_notes } = req.body;

        const dispute = await Dispute.findByPk(id, {
            include: [
                { model: Profile, as: 'user', attributes: ['fullname', 'phone'] },
                { model: Order, as: 'order' }
            ],
            transaction: t,
            lock: true
        });
        if (!dispute) {
            await t.rollback();
            return res.status(404).json({ error: 'Litige introuvable' });
        }

        // Build status history
        const newHistory = [...(dispute.status_history || []), { status, date: new Date(), actor: 'admin' }];
        dispute.status_history = newHistory;

        dispute.status = status;
        if (resolution) dispute.resolution = resolution;
        if (admin_notes) dispute.admin_notes = admin_notes;
        if (status === 'resolved' || status === 'cancelled') {
            dispute.resolved_at = new Date();
        }
        await dispute.save({ transaction: t });

        // Sync Order.dispute_status
        if (dispute.order) {
            const orderDisputeMap = {
                resolved: 'resolu',
                cancelled: 'annule',
                under_review: 'en_cours'
            };
            if (orderDisputeMap[status]) {
                await dispute.order.update(
                    { dispute_status: orderDisputeMap[status] },
                    { transaction: t }
                );
            }
        }

        // Remboursement — traitement atomique
        if (action === 'refund' && dispute.order) {
            const providedRefund = refund_amount ? parseFloat(refund_amount) : 0;
            const refundAmountFinal = providedRefund > 0
                ? providedRefund
                : parseFloat(dispute.order.total_amount || 0);

            if (refundAmountFinal > 0 && dispute.user_id) {
                // Save refund_amount on dispute
                dispute.refund_amount = refundAmountFinal;
                await dispute.save({ transaction: t });

                // 1. Annuler tous les gains (fournisseur, livreur, admin) liés à cette commande
                await FinancialTransaction.update(
                    { status: 'cancelled' },
                    {
                        where: { order_id: dispute.order_id, type: 'earning', status: 'completed' },
                        transaction: t
                    }
                );

                // 2. Créditer le client
                await FinancialTransaction.create({
                    id: crypto.randomUUID(),
                    user_id: dispute.user_id,
                    order_id: dispute.order_id,
                    amount: refundAmountFinal,
                    type: 'adjustment',
                    source: 'dispute_refund',
                    description: `Remboursement litige #${id.slice(0, 8)} — ${resolution || 'Décision admin'}`,
                    status: 'completed',
                }, { transaction: t });
            }
        }

        await t.commit();

        // ── Notifications post-commit (non critiques) ──────────────────────
        const notifMessages = {
            resolved: `✅ Votre litige #${id.slice(0, 8)} a été résolu. ${resolution || ''}`.trim(),
            cancelled: `❌ Votre litige #${id.slice(0, 8)} a été clôturé. ${resolution || ''}`.trim(),
            under_review: `🔍 Votre litige #${id.slice(0, 8)} est en cours d'examen par notre équipe.`,
        };

        if (notifMessages[status] && dispute.user_id) {
            const titleMap = {
                resolved: '✅ Litige résolu',
                cancelled: '❌ Litige clôturé',
                under_review: '🔍 Litige en cours d\'examen',
            };

            Notification.create({
                id: crypto.randomUUID(),
                user_id: dispute.user_id,
                title: titleMap[status],
                message: notifMessages[status],
                type: 'info',
                is_read: false,
            }).catch(err => console.error('[Notif dispute]', err.message));

            const clientPhone = dispute.user?.phone;
            if (clientPhone) {
                sendWhatsAppMessage(clientPhone, notifMessages[status]).catch(warnWA);
            }
        }

        if (action === 'refund' && dispute.user_id) {
            const refundAmountForNotif = refund_amount ? parseFloat(refund_amount) : parseFloat(dispute.order?.total_amount || 0);
            Notification.create({
                id: crypto.randomUUID(),
                user_id: dispute.user_id,
                title: '💸 Remboursement effectué',
                message: `Un remboursement de ${refundAmountForNotif.toLocaleString()} F a été crédité sur votre compte pour le litige #${id.slice(0, 8)}.`,
                type: 'success',
                is_read: false,
            }).catch(err => console.error('[Notif refund]', err.message));
        }

        notifyAdmin(`📋 Litige #${id.slice(0, 8)} → ${status}${action === 'refund' ? ' + REMBOURSEMENT' : ''}`).catch(warnWA);

        // Strip admin_notes from response (never sent to client)
        const disputeJson = dispute.toJSON();
        delete disputeJson.admin_notes;

        res.json(disputeJson);
    } catch (error) {
        await t.rollback();
        console.error('Error updating dispute:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const supplierRespondToDispute = async (req, res) => {
    try {
        const { id } = req.params;
        const { supplier_response, supplier_evidence_url } = req.body;

        const dispute = await Dispute.findByPk(id);
        if (!dispute) return res.status(404).json({ error: 'Litige non trouvé' });

        const newHistory = [...(dispute.status_history || []), {
            status: 'supplier_responded',
            date: new Date(),
            actor: 'supplier'
        }];

        await dispute.update({
            supplier_response: supplier_response || dispute.supplier_response,
            supplier_evidence_url: supplier_evidence_url || dispute.supplier_evidence_url,
            status_history: newHistory
        });

        // Notify admin
        notifyAdmin(`📦 Réponse fournisseur reçue pour litige #${id.slice(0, 8)}`).catch(() => {});

        // In-app notification to the client (user who filed the dispute)
        if (dispute.user_id) {
            await Notification.create({
                id: crypto.randomUUID(),
                user_id: dispute.user_id,
                title: '🏪 Réponse du vendeur',
                message: `Le vendeur a répondu à votre litige #${id.slice(0, 8)}.`,
                type: 'info',
                is_read: false,
            }).catch(() => {});
        }

        res.json({ message: 'Réponse fournisseur enregistrée', dispute });
    } catch (error) {
        console.error('Error in supplierRespondToDispute:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const addDisputeEvidence = async (req, res) => {
    try {
        const { id } = req.params;
        const { photo_url } = req.body;
        const userId = req.auth?.userId;

        const order = await Order.findByPk(id);
        if (!order) return res.status(404).json({ error: 'Commande non trouvée' });
        if (order.user_id !== userId) return res.status(403).json({ error: 'Accès non autorisé' });

        const dispute = await Dispute.findOne({
            where: { order_id: id, status: { [Op.in]: ['open', 'under_review'] } }
        });
        if (!dispute) return res.status(404).json({ error: 'Aucun litige actif trouvé' });

        const newHistory = [...(dispute.status_history || []), {
            status: 'evidence_added',
            date: new Date(),
            actor: 'client'
        }];
        await dispute.update({ photo_url, status_history: newHistory });

        notifyAdmin(`📎 Nouvelle preuve ajoutée pour litige #${dispute.id.slice(0, 8)} (Commande #${id.slice(0, 8)})`).catch(err => console.error('[WA evidence]', err.message));

        res.json({ message: 'Preuve ajoutée avec succès', dispute });
    } catch (error) {
        console.error("ADD EVIDENCE ERROR:", error);
        res.status(500).json({ error: 'Erreur serveur' });
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
