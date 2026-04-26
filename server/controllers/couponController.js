import { Coupon } from '../models/index.js';
import { Op } from 'sequelize';

export const validateCoupon = async (req, res) => {
    try {
        const { code, amount } = req.body;
        const now = new Date();

        const coupon = await Coupon.findOne({
            where: {
                code: code,
                active: true,
                start_date: { [Op.lte]: now },
                end_date: { [Op.gte]: now }
            }
        });

        if (!coupon) {
            return res.status(404).json({ error: 'Code promo invalide ou expiré' });
        }

        if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
            return res.status(400).json({ error: 'Ce code promo a atteint sa limite d’utilisation' });
        }

        if (amount < parseFloat(coupon.min_order_amount)) {
            return res.status(400).json({ error: `Le montant minimum pour ce coupon est de ${coupon.min_order_amount} FCFA` });
        }

        let discount = 0;
        if (coupon.discount_type === 'percentage') {
            discount = (amount * parseFloat(coupon.discount_value)) / 100;
        } else {
            discount = parseFloat(coupon.discount_value);
        }

        res.json({
            message: 'Coupon valide',
            discount: Math.min(discount, amount), // Cannot discount more than total
            code: coupon.code,
            type: coupon.discount_type,
            value: coupon.discount_value
        });

    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la validation du coupon' });
    }
};

export const createCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.create(req.body);
        res.status(201).json(coupon);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la création du coupon' });
    }
};

export const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.findAll({ order: [['created_at', 'DESC']] });
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
