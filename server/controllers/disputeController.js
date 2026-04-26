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
