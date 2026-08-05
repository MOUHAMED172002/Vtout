import { Coupon, CouponUsage, Order, Category, Profile } from '../models/index.js';
import { Op } from 'sequelize';

// Types de coupon supportés :
// 1. Code de bienvenue      → first_order_only = true
// 2. Réduction en pourcentage → discount_type = 'percentage' (+ max_discount_amount optionnel)
// 4. Livraison gratuite     → discount_type = 'free_shipping'
// 7. Code par catégorie     → category_id renseigné
// 8. Code personnel         → assigned_user_id renseigné

export const validateCoupon = async (req, res) => {
    try {
        const { code, amount, items } = req.body; // items (optionnel) : [{ category_id, subtotal }]
        const userId = req.auth?.userId || null;
        const now = new Date();

        if (!code) {
            return res.status(400).json({ error: 'Code promo manquant' });
        }

        const coupon = await Coupon.findOne({
            where: {
                code: code.trim().toUpperCase(),
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

        // Type 8 — code personnel : réservé à un client précis
        if (coupon.assigned_user_id) {
            if (!userId) {
                return res.status(401).json({ error: 'Connectez-vous pour utiliser ce code' });
            }
            if (coupon.assigned_user_id !== userId) {
                return res.status(403).json({ error: 'Ce code ne vous est pas destiné' });
            }
        }

        // Type 1 — code de bienvenue : valable uniquement avant toute commande payée
        if (coupon.first_order_only) {
            if (!userId) {
                return res.status(401).json({ error: 'Connectez-vous pour utiliser ce code de bienvenue' });
            }
            const hasOrdered = await Order.findOne({
                where: { user_id: userId, payment_status: 'payé' }
            });
            if (hasOrdered) {
                return res.status(400).json({ error: 'Ce code est réservé aux nouveaux clients' });
            }
        }

        // Anti-fraude : un même compte ne peut réutiliser un coupon déjà consommé
        if (userId) {
            const alreadyUsed = await CouponUsage.findOne({ where: { coupon_id: coupon.id, user_id: userId } });
            if (alreadyUsed) {
                return res.status(400).json({ error: 'Vous avez déjà utilisé ce code promo' });
            }
        }

        // Type 7 — restreint à une catégorie : la réduction ne porte que sur les
        // articles du panier appartenant à cette catégorie.
        let baseAmount = parseFloat(amount) || 0;
        if (coupon.category_id) {
            if (Array.isArray(items) && items.length > 0) {
                const eligible = items
                    .filter(it => Number(it.category_id) === Number(coupon.category_id))
                    .reduce((sum, it) => sum + (parseFloat(it.subtotal) || 0), 0);
                if (eligible <= 0) {
                    return res.status(400).json({ error: 'Ce code ne s’applique à aucun article de votre panier' });
                }
                baseAmount = eligible;
            }
            // Si le panier détaillé n'est pas fourni (ex: aperçu simple), on retombe
            // sur le montant total — l'application réelle côté commande, elle, fournit toujours `items`.
        }

        if (baseAmount < parseFloat(coupon.min_order_amount || 0)) {
            return res.status(400).json({ error: `Le montant minimum pour ce coupon est de ${coupon.min_order_amount} FCFA` });
        }

        let discount = 0;
        let freeShipping = false;

        if (coupon.discount_type === 'free_shipping') {
            // Type 4 — annule les frais de livraison (calculés séparément, après
            // le choix de la commune/adresse) ; aucune réduction sur le montant des articles.
            freeShipping = true;
        } else if (coupon.discount_type === 'percentage') {
            discount = (baseAmount * parseFloat(coupon.discount_value)) / 100;
            if (coupon.max_discount_amount) {
                discount = Math.min(discount, parseFloat(coupon.max_discount_amount));
            }
        } else {
            discount = parseFloat(coupon.discount_value) || 0;
        }

        discount = Math.min(discount, baseAmount);

        res.json({
            message: 'Coupon valide',
            discount,
            freeShipping,
            code: coupon.code,
            type: coupon.discount_type,
            value: coupon.discount_value,
            categoryId: coupon.category_id
        });

    } catch (error) {
        console.error('validateCoupon error:', error);
        res.status(500).json({ error: 'Erreur lors de la validation du coupon' });
    }
};

export const createCoupon = async (req, res) => {
    try {
        const body = { ...req.body };

        if (!body.code || !body.code.trim()) {
            return res.status(400).json({ error: 'Le code est obligatoire' });
        }
        body.code = body.code.trim().toUpperCase();

        if (!body.start_date || !body.end_date) {
            return res.status(400).json({ error: 'Les dates de début et de fin sont obligatoires' });
        }

        const type = body.discount_type || 'percentage';
        if (type === 'free_shipping') {
            body.discount_value = null;
        } else if (!body.discount_value || parseFloat(body.discount_value) <= 0) {
            return res.status(400).json({ error: 'La valeur de la réduction doit être supérieure à 0' });
        }

        if (type !== 'percentage') {
            body.max_discount_amount = null;
        }

        if (body.category_id) {
            const category = await Category.findByPk(body.category_id);
            if (!category) {
                return res.status(400).json({ error: 'Catégorie introuvable' });
            }
        } else {
            body.category_id = null;
        }

        if (body.assigned_user_id) {
            const profile = await Profile.findByPk(body.assigned_user_id);
            if (!profile) {
                return res.status(400).json({ error: 'Client introuvable' });
            }
        } else {
            body.assigned_user_id = null;
        }

        const existing = await Coupon.findOne({ where: { code: body.code } });
        if (existing) {
            return res.status(409).json({ error: 'Ce code existe déjà' });
        }

        const coupon = await Coupon.create(body);
        res.status(201).json(coupon);
    } catch (error) {
        console.error('createCoupon error:', error);
        res.status(500).json({ error: 'Erreur lors de la création du coupon' });
    }
};

export const updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByPk(req.params.id);
        if (!coupon) {
            return res.status(404).json({ error: 'Coupon introuvable' });
        }

        const body = { ...req.body };
        if (body.code) {
            body.code = body.code.trim().toUpperCase();
            const existing = await Coupon.findOne({ where: { code: body.code, id: { [Op.ne]: coupon.id } } });
            if (existing) {
                return res.status(409).json({ error: 'Ce code existe déjà' });
            }
        }

        const type = body.discount_type || coupon.discount_type;
        if (type === 'free_shipping') {
            body.discount_value = null;
        }
        if (type !== 'percentage') {
            body.max_discount_amount = null;
        }

        await coupon.update(body);
        res.json(coupon);
    } catch (error) {
        console.error('updateCoupon error:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour du coupon' });
    }
};

export const toggleCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByPk(req.params.id);
        if (!coupon) {
            return res.status(404).json({ error: 'Coupon introuvable' });
        }
        await coupon.update({ active: !coupon.active });
        res.json(coupon);
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByPk(req.params.id);
        if (!coupon) {
            return res.status(404).json({ error: 'Coupon introuvable' });
        }
        const usageCount = await CouponUsage.count({ where: { coupon_id: coupon.id } });
        if (usageCount > 0) {
            // Déjà utilisé : on désactive plutôt que de casser l'historique.
            await coupon.update({ active: false });
            return res.json({ message: 'Coupon déjà utilisé : désactivé au lieu d’être supprimé', coupon });
        }
        await coupon.destroy();
        res.json({ message: 'Coupon supprimé' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la suppression du coupon' });
    }
};

export const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.findAll({
            include: [
                { model: Category, as: 'category', attributes: ['id', 'name'] },
                { model: Profile, as: 'assignedUser', attributes: ['id', 'fullname', 'email'] }
            ],
            order: [['created_at', 'DESC']]
        });
        res.json(coupons);
    } catch (error) {
        console.error('getAllCoupons error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const getCouponUsages = async (req, res) => {
    try {
        const usages = await CouponUsage.findAll({
            where: { coupon_id: req.params.id },
            include: [{ model: Profile, as: 'user', attributes: ['id', 'name', 'email'] }],
            order: [['created_at', 'DESC']]
        });
        res.json(usages);
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
