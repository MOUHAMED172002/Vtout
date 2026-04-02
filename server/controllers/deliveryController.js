const { DeliveryPerson, Order, Address, Profile, OrderItem, Product, Supplier, ProductVariant } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

exports.getAvailableOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: {
                status: 'confirmee',
                delivery_person_id: null,
                supplier_id: { [Op.not]: null }
            },
            include: [
                { model: Address, as: 'address' },
                { model: Supplier, as: 'supplier' },
                {
                    model: OrderItem, as: 'items',
                    include: [
                        { model: Product, as: 'product' },
                        { model: ProductVariant, as: 'variant' }
                    ]
                }
            ],
            order: [['created_at', 'ASC']]
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des commandes disponibles', details: error.message });
    }
};

exports.assignToMe = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { orderId } = req.body;

        const deliveryPerson = await DeliveryPerson.findOne({ where: { user_id: userId } });
        if (!deliveryPerson) return res.status(403).json({ error: 'Vous n\'êtes pas enregistré comme livreur' });

        const order = await Order.findByPk(orderId);
        if (!order) return res.status(404).json({ error: 'Commande non trouvée' });
        if (order.delivery_person_id) return res.status(400).json({ error: 'Commande déjà assignée' });

        const unremittedCashCount = await Order.count({
            where: {
                delivery_person_id: deliveryPerson.id,
                status: 'livree',
                payment_method: 'delivery',
                payment_status: 'en_attente'
            }
        });

        if (unremittedCashCount > 0) {
            return res.status(403).json({
                error: "Dette active : Veuillez d'abord remettre l'argent des livraisons complétées à l'administrateur afin de prendre une nouvelle course."
            });
        }

        await order.update({ delivery_person_id: deliveryPerson.id, assigned_at: new Date(), status: 'confirmee' });
        res.json({ message: 'Commande assignée avec succès', order });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l\'assignation de la commande' });
    }
};

exports.releaseOrder = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { orderId } = req.body;

        const deliveryPerson = await DeliveryPerson.findOne({ where: { user_id: userId } });
        if (!deliveryPerson) return res.status(403).json({ error: 'Vous n\'êtes pas enregistré comme livreur' });

        const order = await Order.findOne({ where: { id: orderId, delivery_person_id: deliveryPerson.id } });
        if (!order) return res.status(404).json({ error: 'Commande non trouvée' });
        if (order.status !== 'confirmee') return res.status(400).json({ error: 'Impossible de désassigner une commande déjà expédiée ou livrée' });

        await order.update({ delivery_person_id: null, assigned_at: null });
        res.json({ message: 'Commande désassignée avec succès', order });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la désassignation de la commande' });
    }
};

exports.updateDeliveryStatus = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { orderId, status, delivery_code } = req.body;

        const deliveryPerson = await DeliveryPerson.findOne({ where: { user_id: userId } });
        const order = await Order.findOne({ where: { id: orderId, delivery_person_id: deliveryPerson?.id } });
        if (!order) return res.status(404).json({ error: 'Commande assignée non trouvée' });

        const updateData = { status };

        if (status === 'expediee') {
            updateData.picked_up_at = new Date();
        }

        if (status === 'livree') {
            if (!delivery_code || order.delivery_code !== delivery_code) {
                return res.status(400).json({ error: 'Code de confirmation de livraison incorrect. Veuillez demander le code au client.' });
            }
            updateData.delivered_at = new Date();
            await deliveryPerson.increment('total_deliveries');
        }

        await order.update(updateData);
        res.json({ message: 'Statut mis à jour', order });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
    }
};

exports.getMyDeliveries = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const deliveryPerson = await DeliveryPerson.findOne({ where: { user_id: userId } });
        if (!deliveryPerson) return res.json([]);

        const orders = await Order.findAll({
            where: { delivery_person_id: deliveryPerson.id },
            include: [
                { model: Address, as: 'address' },
                { model: Supplier, as: 'supplier' },
                {
                    model: OrderItem, as: 'items',
                    include: [
                        { model: Product, as: 'product' },
                        { model: ProductVariant, as: 'variant' }
                    ]
                }
            ],
            order: [['updated_at', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération de vos courses', details: error.message });
    }
};

exports.toggleStatus = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { status, lat, lng } = req.body;

        const deliveryPerson = await DeliveryPerson.findOne({ where: { user_id: userId } });
        if (!deliveryPerson) return res.status(404).json({ error: 'Livreur non trouvé' });

        const updateData = { status };
        if (lat && lng) {
            updateData.lat = lat;
            updateData.lng = lng;
            updateData.last_location_update = new Date();
        }

        await deliveryPerson.update(updateData);
        res.json({ message: 'Statut mis à jour', deliveryPerson });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

exports.updateLocation = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { lat, lng } = req.body;

        if (!lat || !lng) return res.status(400).json({ error: 'Coordonnées requises' });

        const deliveryPerson = await DeliveryPerson.findOne({ where: { user_id: userId } });
        if (!deliveryPerson) return res.status(404).json({ error: 'Livreur non trouvé' });

        await deliveryPerson.update({ lat, lng, last_location_update: new Date() });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erreur mise à jour position' });
    }
};

exports.updateServiceZones = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { zones } = req.body;

        const deliveryPerson = await DeliveryPerson.findOne({ where: { user_id: userId } });
        if (!deliveryPerson) return res.status(404).json({ error: 'Livreur non trouvé' });

        await deliveryPerson.update({ service_zones: zones });
        res.json({ message: 'Zones de service mises à jour', zones });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour des zones' });
    }
};

exports.getMyProfile = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const deliveryPerson = await DeliveryPerson.findOne({
            where: { user_id: userId },
            include: [{ model: Profile, as: 'profile', attributes: ['id', 'fullname', 'email', 'phone', 'avatar_url'] }]
        });
        if (!deliveryPerson) return res.status(404).json({ error: 'Profil livreur non trouvé' });
        res.json(deliveryPerson);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
    }
};

exports.getLivreursList = async (req, res) => {
    try {
        const livreurs = await DeliveryPerson.findAll({
            include: [{ model: Profile, as: 'profile', attributes: ['id', 'fullname', 'email', 'phone'] }]
        });
        res.json(livreurs);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des livreurs' });
    }
};

exports.getDeliveryStatsAdmin = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const debts = await Order.findAll({
            where: { payment_method: 'delivery', payment_status: 'en_attente', status: 'livree', delivery_person_id: { [Op.ne]: null } },
            attributes: [
                'delivery_person_id',
                [sequelize.fn('SUM', sequelize.col('Order.total_amount')), 'total_debt'],
                [sequelize.fn('COUNT', sequelize.col('Order.id')), 'order_count']
            ],
            group: ['Order.delivery_person_id'],
            include: [{ model: DeliveryPerson, as: 'deliveryPerson', include: [{ model: Profile, as: 'profile', attributes: ['fullname'] }] }]
        });

        const dailyDeliveries = await Order.findAll({
            where: { status: 'livree', updated_at: { [Op.gte]: today }, delivery_person_id: { [Op.ne]: null } },
            attributes: [
                'delivery_person_id',
                [sequelize.fn('COUNT', sequelize.col('Order.id')), 'count']
            ],
            group: ['Order.delivery_person_id'],
            include: [{ model: DeliveryPerson, as: 'deliveryPerson', include: [{ model: Profile, as: 'profile', attributes: ['fullname'] }] }]
        });

        res.json({ debts, dailyDeliveries, timestamp: new Date() });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors du calcul des stats', details: error.message });
    }
};

exports.confirmCashRemitted = async (req, res) => {
    try {
        const { deliveryPersonId } = req.body;
        if (!deliveryPersonId) return res.status(400).json({ error: 'ID du livreur requis' });

        const [updatedCount] = await Order.update(
            { payment_status: 'payé' },
            { where: { delivery_person_id: deliveryPersonId, payment_method: 'delivery', payment_status: 'en_attente', status: 'livree' } }
        );
        res.json({ message: `Paiements confirmés pour ${updatedCount} commandes.`, count: updatedCount });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la confirmation du versement' });
    }
};

exports.verifyLivreur = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_verified } = req.body;

        const deliveryPerson = await DeliveryPerson.findByPk(id);
        if (!deliveryPerson) return res.status(404).json({ error: 'Livreur non trouvé' });

        await deliveryPerson.update({ is_verified });

        const profile = await Profile.findByPk(deliveryPerson.user_id);
        if (profile) await profile.update({ role: is_verified ? 'livreur' : 'user' });

        res.json({ message: 'Statut mis à jour et rôle synchronisé' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la vérification' });
    }
};

exports.adminAssignOrder = async (req, res) => {
    try {
        const { orderId, deliveryPersonId } = req.body;

        const order = await Order.findByPk(orderId);
        if (!order) return res.status(404).json({ error: 'Commande non trouvée' });

        if (!deliveryPersonId) {
            await order.update({ delivery_person_id: null, assigned_at: null });
            return res.json({ message: 'Livreur retiré de la commande', order });
        }

        const deliveryPerson = await DeliveryPerson.findByPk(deliveryPersonId);
        if (!deliveryPerson) return res.status(404).json({ error: 'Livreur non trouvé' });

        const updateData = { delivery_person_id: deliveryPerson.id, assigned_at: order.assigned_at || new Date() };
        if (order.status === 'en_attente') updateData.status = 'confirmee';

        await order.update(updateData);
        res.json({ message: 'Commande assignée par l\'administrateur', order });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l\'assignation administrative' });
    }
};

exports.registerLivreur = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { vehicle_type, vehicle_model, license_plate, id_card_url, phone, fullname, service_zones } = req.body;

        const [deliveryPerson, created] = await DeliveryPerson.findOrCreate({
            where: { user_id: userId },
            defaults: { vehicle_type, vehicle_model, license_plate, id_card_url, service_zones: service_zones || [], is_verified: false }
        });

        if (!created) {
            await deliveryPerson.update({ vehicle_type, vehicle_model, license_plate, id_card_url, service_zones: service_zones || [], is_verified: false });
        }

        const profile = await Profile.findByPk(userId);
        if (profile) {
            const updates = {};
            if (phone && profile.phone !== phone) updates.phone = phone;
            if (fullname && profile.fullname !== fullname) updates.fullname = fullname;
            if (Object.keys(updates).length > 0) await profile.update(updates);
        }

        res.json({ message: 'Demande d\'inscription envoyée. En attente de vérification.', deliveryPerson });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l\'enregistrement' });
    }
};
