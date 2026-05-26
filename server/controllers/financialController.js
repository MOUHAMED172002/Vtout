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
            group: ['type'],
            raw: true
        });
        
        let balance = 0;
        if (summary && summary.length > 0) {
            summary.forEach(s => {
                const val = parseFloat(s.total || 0);
                if (s.type === 'earning') balance += val;
                if (s.type === 'payout') balance -= val;
                if (s.type === 'adjustment') balance += val; // can be negative
            });
        }
        
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
    const t = await sequelize.transaction();
    try {
        const userId = req.auth.userId;
        const { amount, payment_method, payment_details, save_details } = req.body;
        
        if (!amount || amount <= 0) {
            await t.rollback();
            return res.status(400).json({ error: 'Montant invalide' });
        }

        // LOCK the profile to prevent concurrent payout requests for the same user
        const profile = await Profile.findByPk(userId, { transaction: t, lock: true });
        if (!profile) {
            await t.rollback();
            return res.status(404).json({ error: 'Profil non trouvé' });
        }
        
        // Calculate current balance (all earnings - all payouts)
        const summary = await FinancialTransaction.findAll({
            where: { user_id: userId, status: 'completed' },
            attributes: ['type', [sequelize.fn('SUM', sequelize.col('amount')), 'total']],
            group: ['type'],
            transaction: t
        });
        
        let balance = 0;
        summary.forEach(s => {
            const val = parseFloat(s.get('total') || 0);
            if (s.type === 'earning') balance += val;
            if (s.type === 'payout') balance -= val;
            if (s.type === 'adjustment') balance += val;
        });

        // Deduct pending or approved payouts
        const pendingPayouts = await PayoutRequest.sum('amount', {
            where: { user_id: userId, status: ['pending', 'approved'] },
            transaction: t
        });
        
        const availableBalance = balance - (pendingPayouts || 0);
        
        if (availableBalance < amount) {
            await t.rollback();
            return res.status(400).json({ error: 'Solde disponible insuffisant (incluant vos demandes en cours)' });
        }

        if (save_details) {
            const metadata = { ...(profile.metadata || {}) };
            metadata.payout_info = {
                method: payment_method,
                details: payment_details
            };
            await profile.update({ metadata }, { transaction: t });
        }
        
        const payoutRequest = await PayoutRequest.create({
            id: crypto.randomUUID(),
            user_id: userId,
            role: profile.role,
            amount,
            payment_method,
            payment_details,
            status: 'pending'
        }, { transaction: t });
        
        await t.commit();
        res.status(201).json(payoutRequest);
    } catch (error) {
        if (t) await t.rollback();
        console.error('RequestPayout error:', error);
        res.status(500).json({ error: 'Erreur lors de la demande de retrait' });
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
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { status, admin_notes } = req.body; // approved, paid, rejected
        
        const payout = await PayoutRequest.findByPk(id, { transaction: t });
        if (!payout) {
            await t.rollback();
            return res.status(404).json({ error: 'Demande non trouvée' });
        }
        
        const oldStatus = payout.status;

        // LOCK the user profile to ensure balance is stable during processing
        await Profile.findByPk(payout.user_id, { transaction: t, lock: true });

        await payout.update({ status, admin_notes, processed_at: new Date() }, { transaction: t });
        
        // If transitioning to 'paid', record the final transaction
        if (status === 'paid' && oldStatus !== 'paid') {
            // Re-calculate balance inside the transaction
            const summary = await FinancialTransaction.findAll({
                where: { user_id: payout.user_id, status: 'completed' },
                attributes: ['type', [sequelize.fn('SUM', sequelize.col('amount')), 'total']],
                group: ['type'],
                transaction: t
            });

            let currentBalance = 0;
            summary.forEach(s => {
                const val = parseFloat(s.get('total') || 0);
                if (s.type === 'earning') currentBalance += val;
                if (s.type === 'payout') currentBalance -= val;
                if (s.type === 'adjustment') currentBalance += val;
            });

            if (currentBalance < payout.amount) {
                await t.rollback();
                // We don't update to rejected automatically here, we just block the admin action
                return res.status(400).json({ error: 'Solde insuffisant pour confirmer ce paiement.' });
            }

            await FinancialTransaction.create({
                id: crypto.randomUUID(),
                user_id: payout.user_id,
                type: 'payout',
                amount: payout.amount,
                description: `Retrait ${payout.id.slice(0,8)}`,
                status: 'completed'
            }, { transaction: t });
        }
        
        await t.commit();
        res.json(payout);
    } catch (error) {
        if (t) await t.rollback();
        console.error('AdminProcessPayout error:', error);
        res.status(500).json({ error: 'Erreur lors du traitement du retrait' });
    }
};


export const adminSyncFinancials = async (req, res) => {
    try {
        const { processOrderFinancials } = await import('../services/financialService.js');

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
            { where: { type: 'earning', status: { [Op.in]: ['pending', null] } } }
        );

        // 3. Find ALL delivered orders
        const orders = await Order.findAll({ 
            where: { status: { [Op.in]: ['livrée', 'livree'] } } 
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

export const adminGetSupplierFinancials = async (req, res) => {
    try {
        const { userId } = req.params;
        
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
        
        const transactions = await FinancialTransaction.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']],
            limit: 50
        });
        
        const payoutRequests = await PayoutRequest.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']]
        });
        
        res.json({ balance, transactions, payoutRequests });
    } catch (error) {
        console.error('AdminGetSupplierFinancials error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const adminGetBoutiqueStats = async (req, res) => {
    try {
        const { boutiqueId } = req.params;
        
        const items = await OrderItem.findAll({
            include: [
                { 
                    model: Product, 
                    as: 'product', 
                    where: { boutique_id: boutiqueId },
                    attributes: ['id', 'name']
                },
                { 
                    model: Order, 
                    as: 'order', 
                    where: { status: 'livrée' },
                    attributes: ['id', 'created_at']
                }
            ]
        });
        
        let totalSales = 0;
        let totalEarnings = 0;
        let totalCommissions = 0;
        
        // Calculate based on the 10% logic in financialService
        items.forEach(item => {
            const price = parseFloat(item.price);
            const qty = parseInt(item.quantity);
            const gross = price * qty;
            const comm = gross * 0.10; // 10% commission
            const net = gross - comm;
            
            totalSales += gross;
            totalEarnings += net;
            totalCommissions += comm;
        });
        
        res.json({
            boutique_id: boutiqueId,
            stats: {
                totalSales,
                totalEarnings,
                totalCommissions,
                ordersCount: new Set(items.map(i => i.order_id)).size,
                itemsCount: items.length
            },
            recentTransactions: items.slice(0, 10).map(i => ({
                order_id: i.order_id,
                product_name: i.product?.name,
                amount: parseFloat(i.price) * parseInt(i.quantity),
                date: i.order?.created_at
            }))
        });
    } catch (error) {
        console.error('AdminGetBoutiqueStats error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};