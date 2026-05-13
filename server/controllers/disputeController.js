import { Dispute, Profile, Supplier, Order } from '../models/index.js';

export const getAllDisputes = async (req, res) => {
    try {
        const disputes = await Dispute.findAll({
            include: [
                { model: Profile, as: 'user', attributes: ['fullname', 'email'] },
                { model: Supplier, as: 'supplier', attributes: ['name', 'email'] },
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
        const { status, resolution } = req.body;

        const dispute = await Dispute.findByPk(id);
        if (!dispute) {
            return res.status(404).json({ error: 'Dispute not found' });
        }

        dispute.status = status;
        if (resolution) dispute.resolution = resolution;
        if (status === 'resolved') {
            dispute.resolved_at = new Date();
        }

        await dispute.save();
        res.json(dispute);
    } catch (error) {
        console.error('Error updating dispute:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
export const createDispute = async (req, res) => {
    try {
        const { order_id, reason, description } = req.body;
        const userId = req.auth?.userId;

        if (!userId) return res.status(401).json({ error: 'Auth required' });

        const order = await Order.findByPk(order_id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        // Security: only customer who placed the order can open a dispute
        if (order.user_id !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const dispute = await Dispute.create({
            id: crypto.randomUUID(),
            order_id,
            user_id: userId,
            supplier_id: order.supplier_id,
            reason,
            description,
            status: 'open'
        });

        // Update Order status to block financials
        await order.update({ dispute_status: 'ouvert' });

        res.status(201).json(dispute);
    } catch (error) {
        console.error('Error creating dispute:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

import crypto from 'crypto';
