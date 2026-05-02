import { FinancialTransaction, PayoutRequest, Profile, Order } from '../models/index.js';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';
import crypto from 'crypto';


export const getMyFinancials = async (req, res) => {
    try {
        const userId = req.auth?.userId;
        console.log("[Financials] Fetching for userId:", userId);

        if (!userId) {
            console.error("[Financials] No userId found in req.auth");
            return res.status(401).json({ error: 'Non autorisé' });
        }
        
        // Calculate current balance (all earnings - all payouts)
        console.log("[Financials] Querying summary...");
        const summary = await FinancialTransaction.findAll({
            where: { user_id: userId, status: 'completed' },
            attributes: [
                'type',
                [sequelize.fn('SUM', sequelize.col('amount')), 'total']
            ],
            group: ['type']
        });
        
        let balance = 0;
        summary.forEach(s => {
            const val = parseFloat(s.get('total') || 0);
            if (s.type === 'earning') balance += val;
            if (s.type === 'payout') balance -= val;
            if (s.type === 'adjustment') balance += val; // can be negative
        });
        
        console.log("[Financials] Querying transactions...");
        const transactions = await FinancialTransaction.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']],
            limit: 20
        });
        
        console.log("[Financials] Querying payout requests...");
        const payoutRequests = await PayoutRequest.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']]
        });
        
        const profile = await Profile.findByPk(userId);
        
        console.log("[Financials] Success, sending response.");
        res.json({ 
            balance, 
            transactions, 
            payoutRequests,
            savedPayoutInfo: profile?.metadata?.payout_info || null
        });
    } catch (error) {
        console.error('GetMyFinancials error:', error);
        res.status(500).json({ error: 'Erreur serveur: ' + error.message });
    }
};

export const requestPayout = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { amount, payment_method, payment_details, save_details } = req.body;
        
        if (!amount || amount <= 0) return res.status(400).json({ error: 'Montant invalide' });
        
        // check balance
        const summary = await FinancialTransaction.findAll({
            where: { user_id: userId, status: 'completed' },
            attributes: ['type', [sequelize.fn('SUM', sequelize.col('amount')), 'total']],
            group: ['type']
        });
        
        let balance = 0;
        summary.forEach(s => {
            const val = parseFloat(s.get('total') || 0);
            if (s.type === 'earning') balance += val;
            if (s.type === 'payout') balance -= val;
            if (s.type === 'adjustment') balance += val;
        });

        // SECURITE: Déduire les demandes de retrait déjà en attente ou approuvées (non payées)
        const pendingPayouts = await PayoutRequest.sum('amount', {
            where: { user_id: userId, status: ['pending', 'approved'] }
        });
        
        const availableBalance = balance - (pendingPayouts || 0);
        
        let status = 'pending';
        let admin_notes = null;
        
        if (availableBalance < amount) {
            return res.status(400).json({ error: 'Solde disponible insuffisant (Fonds en attente inclus)' });
        }
        
        const profile = await Profile.findByPk(userId);

        if (save_details && profile) {
            const metadata = { ...(profile.metadata || {}) };
            metadata.payout_info = {
                method: payment_method,
                details: payment_details
            };
            await profile.update({ metadata });
        }
        
        const payoutRequest = await PayoutRequest.create({
            id: crypto.randomUUID(),
            user_id: userId,
            role: profile.role,
            amount,
            payment_method,
            payment_details,
            status,
            admin_notes
        });
        
        res.status(201).json(payoutRequest);
    } catch (error) {
        console.error('RequestPayout error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const adminGetAllPayoutRequests = async (req, res) => {
    try {
        const requests = await PayoutRequest.findAll({
            include: [{ model: Profile, as: 'user', attributes: ['fullname', 'email', 'phone'] }],
            order: [['created_at', 'DESC']]
        });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const adminProcessPayout = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_notes } = req.body; // approved, paid, rejected
        
        const payout = await PayoutRequest.findByPk(id);
        if (!payout) return res.status(404).json({ error: 'Demande non trouvée' });
        
        const oldStatus = payout.status;
        await payout.update({ status, admin_notes, processed_at: new Date() });
        
        // If transitioning to 'paid' (or 'approved' depending on policy), record the transaction
        if (status === 'paid' && oldStatus !== 'paid') {
            // SECURITE: Revérifier le solde de l'utilisateur avant le paiement final (Race Condition prevention)
            const summary = await FinancialTransaction.findAll({
                where: { user_id: payout.user_id, status: 'completed' },
                attributes: ['type', [sequelize.fn('SUM', sequelize.col('amount')), 'total']],
                group: ['type']
            });
            let currentBalance = 0;
            summary.forEach(s => {
                const val = parseFloat(s.get('total') || 0);
                if (s.type === 'earning') currentBalance += val;
                if (s.type === 'payout') currentBalance -= val;
                if (s.type === 'adjustment') currentBalance += val;
            });

            if (currentBalance < payout.amount) {
                await payout.update({ status: 'rejected', admin_notes: 'Solde insuffisant au moment du paiement' });
                return res.status(400).json({ error: 'Opération bloquée: Le solde de cet utilisateur est devenu insuffisant.' });
            }

            await FinancialTransaction.create({
                id: crypto.randomUUID(),
                user_id: payout.user_id,
                type: 'payout',
                amount: payout.amount,
                description: `Retrait ${payout.id.slice(0,8)}`,
                status: 'completed'
            });
        }
        
        res.json(payout);
    } catch (error) {
        console.error('AdminProcessPayout error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const adminSyncFinancials = async (req, res) => {
    try {
        const { processOrderFinancials } = await import('../services/financialService.js');
        const { DeliveryPerson, Supplier } = await import('../models/index.js');

        console.log("🚀 [AdminSync] Starting Global Financial Sync...");
        
        // 1. Normalize Statuses (Aggressive)
        const replacements = [
            { from: 'confirmee', to: 'confirmée' },
            { from: 'expediee', to: 'expédiée' },
            { from: 'livree', to: 'livrée' },
            { from: 'annulee', to: 'annulée' },
            { from: 'assignee', to: 'assignée' }
        ];

        for (const r of replacements) {
            await sequelize.query(
                'UPDATE orders SET status = :to WHERE status = :from',
                {
                    replacements: { from: r.from, to: r.to },
                    type: sequelize.QueryTypes.UPDATE
                }
            );
        }

        // 2. Mark all earning as completed
        await FinancialTransaction.update(
            { status: 'completed' },
            { where: { type: 'earning', status: ['pending', null] } }
        );

        // 3. Find ALL delivered orders
        const orders = await Order.findAll({ 
            where: { status: ['livrée', 'livree'] } 
        });

        let feesFixed = 0;
        let processedCount = 0;
        let skippedCount = 0;

        for (const order of orders) {
            if (!order.delivery_fee || parseFloat(order.delivery_fee) === 0) {
                await order.update({ delivery_fee: 1000 });
                feesFixed++;
            }

            // Check if earnings already exist for this order (Livreur or Supplier)
            const txCount = await FinancialTransaction.count({
                where: { order_id: order.id, type: 'earning' }
            });

            // Note: Since I fixed processOrderFinancials to be idempotent internally,
            // we can call it even if some transactions exist. It will only create missing ones.
            await processOrderFinancials(order);
            processedCount++;
        }

        res.json({ 
            success: true,
            message: 'Synchronisation terminée', 
            stats: {
                totalDeliveredOrdersFound: orders.length,
                deliveryFeesFixedTo1000: feesFixed,
                ordersProcessed: processedCount
            }
        });
    } catch (error) {
        console.error('AdminSyncFinancials error:', error);
        res.status(500).json({ error: 'Erreur lors de la synchronisation: ' + error.message });
    }
};