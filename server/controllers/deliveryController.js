const { DeliveryPerson, Order, Address, Profile, OrderItem, Product, Supplier, ProductVariant } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Get available orders for delivery (status: 'confirmee', no delivery person, with supplier)
exports.getAvailableOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: {
                status: 'confirmee',
                delivery_person_id: null,
                supplier_id: { [Op.not]: null } // Seules les commandes avec fournisseur sont récupérables
            },
            include: [
                { model: Address, as: 'address' },
                { model: Supplier, as: 'supplier' },
                {
                    model: OrderItem,
                    as: 'items',
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
        console.error('getAvailableOrders error:', error);
        res.status(500).json({
            error: 'Erreur lors de la récupération des commandes disponibles',
            details: error.message,
            stack: error.stack
        });
    }
};

// Assign order to self
exports.assignToMe = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { orderId } = req.body;

        const deliveryPerson = await DeliveryPerson.findOne({ where: { user_id: userId } });
        if (!deliveryPerson) return res.status(403).json({ error: 'Vous n\'êtes pas enregistré comme livreur' });

        const order = await Order.findByPk(orderId);
        if (!order) return res.status(404).json({ error: 'Commande non trouvée' });
        if (order.delivery_person_id) return res.status(400).json({ error: 'Commande déjà assignée' });

        // Check for unremitted cash
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

        await order.update({
            delivery_person_id: deliveryPerson.id,
            assigned_at: new Date(),
            status: 'confirmee'
        });

        res.json({ message: 'Commande assignée avec succès', order });
    } catch (error) {
        console.error('assignToMe error:', error);
        res.status(500).json({ error: 'Erreur lors de l\'assignation de la commande' });
    }
};

// Release order (Cancel assignment by deliverer)
exports.releaseOrder = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { orderId } = req.body;

        const deliveryPerson = await DeliveryPerson.findOne({ where: { user_id: userId } });
        if (!deliveryPerson) return res.status(403).json({ error: 'Vous n\'êtes pas enregistré comme livreur' });

        const order = await Order.findOne({ where: { id: orderId, delivery_person_id: deliveryPerson.id } });
        if (!order) return res.status(404).json({ error: 'Commande non trouvée' });

        if (order.status !== 'confirmee') {
            return res.status(400).json({ error: 'Impossible de désassigner une commande déjà expédiée ou livrée' });
        }

        await order.update({
            delivery_person_id: null,
            assigned_at: null
        });

        res.json({ message: 'Commande désassignée avec succès', order });
    } catch (error) {
        console.error('releaseOrder error:', error);
        res.status(500).json({ error: 'Erreur lors de la désassignation de la commande' });
    }
};

// Update delivery status (Picked up, Delivered)
exports.updateDeliveryStatus = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { orderId, status } = req.body; // status: 'expediee' (picked up) or 'livree' (delivered)

        const deliveryPerson = await DeliveryPerson.findOne({ where: { user_id: userId } });
        const order = await Order.findOne({
            where: { id: orderId, delivery_person_id: deliveryPerson.id }
        });

        if (!order) return res.status(404).json({ error: 'Commande assignée non trouvée' });

        const updateData = { status };
        if (status === 'expediee') {
            updateData.picked_up_at = new Date();
        }
        if (status === 'livree') {
            updateData.delivered_at = new Date();
            // Increment total deliveries for the delivery person
            await deliveryPerson.increment('total_deliveries');
        }

        await order.update(updateData);
        res.json({ message: 'Statut mis à jour', order });
    } catch (error) {
        console.error('updateDeliveryStatus error:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
    }
};

// Get my assigned orders (active and history)
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
                    model: OrderItem,
                    as: 'items',
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
        console.error('getMyDeliveries error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de vos courses', details: error.message });
    }
};

// Toggle online/offline status
exports.toggleStatus = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { status } = req.body; // 'disponible', 'hors_ligne'

        const deliveryPerson = await DeliveryPerson.findOne({ where: { user_id: userId } });
        if (!deliveryPerson) return res.status(404).json({ error: 'Livreur non trouvé' });

        await deliveryPerson.update({ status });
        res.json({ message: 'Statut mis à jour', deliveryPerson });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// Update service zones
exports.updateServiceZones = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { zones } = req.body; // Array of zones

        const deliveryPerson = await DeliveryPerson.findOne({ where: { user_id: userId } });
        if (!deliveryPerson) return res.status(404).json({ error: 'Livreur non trouvé' });

        await deliveryPerson.update({ service_zones: zones });
        res.json({ message: 'Zones de service mises à jour', zones });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour des zones' });
    }
};

// Get current delivery person profile
exports.getMyProfile = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const deliveryPerson = await DeliveryPerson.findOne({
            where: { user_id: userId },
            include: [{
                model: Profile,
                as: 'profile',
                attributes: ['id', 'fullname', 'email', 'phone', 'avatar_url']
            }]
        });

        if (!deliveryPerson) return res.status(404).json({ error: 'Profil livreur non trouvé' });
        res.json(deliveryPerson);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
    }
};

// Get list of all delivery persons (Admin)
exports.getLivreursList = async (req, res) => {
    try {
        const livreurs = await DeliveryPerson.findAll({
            include: [{
                model: Profile,
                as: 'profile',
                attributes: ['id', 'fullname', 'email', 'phone']
            }],
        });
        res.json(livreurs);
    } catch (error) {
        console.error('getLivreursList error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des livreurs' });
    }
};

// Admin detailed delivery stats (Finance & Activity)
exports.getDeliveryStatsAdmin = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Unremitted cash per delivery person
        const debts = await Order.findAll({
            where: {
                payment_method: 'delivery',
                payment_status: 'en_attente',
                status: 'livree',
                delivery_person_id: { [Op.ne]: null }
            },
            attributes: [
                'delivery_person_id',
                [sequelize.fn('SUM', sequelize.col('Order.total_amount')), 'total_debt'],
                [sequelize.fn('COUNT', sequelize.col('Order.id')), 'order_count']
            ],
            group: [
                'Order.delivery_person_id',
                'deliveryPerson.id',
                'deliveryPerson.profile.id',
                'deliveryPerson.profile.fullname'
            ],
            include: [{
                model: DeliveryPerson,
                as: 'deliveryPerson',
                include: [{
                    model: Profile,
                    as: 'profile',
                    attributes: ['fullname']
                }]
            }]
        });

        // 2. Daily deliveries count per person
        const dailyDeliveries = await Order.findAll({
            where: {
                status: 'livree',
                updated_at: { [Op.gte]: today },
                delivery_person_id: { [Op.ne]: null }
            },
            attributes: [
                'delivery_person_id',
                [sequelize.fn('COUNT', sequelize.col('Order.id')), 'count']
            ],
            group: [
                'Order.delivery_person_id',
                'deliveryPerson.id',
                'deliveryPerson.profile.id',
                'deliveryPerson.profile.fullname'
            ],
            include: [{
                model: DeliveryPerson,
                as: 'deliveryPerson',
                include: [{
                    model: Profile,
                    as: 'profile',
                    attributes: ['fullname']
                }]
            }]
        });

        res.json({
            debts,
            dailyDeliveries,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('getDeliveryStatsAdmin error:', error);
        res.status(500).json({
            error: 'Erreur lors du calcul des stats',
            details: error.message
        });
    }
};

// Admin confirms receipt of cash from a delivery person
exports.confirmCashRemitted = async (req, res) => {
    try {
        const { deliveryPersonId } = req.body;
        if (!deliveryPersonId) return res.status(400).json({ error: 'ID du livreur requis' });

        // Update all delivered orders for this person that are unpaid
        const [updatedCount] = await Order.update(
            { payment_status: 'payé' },
            {
                where: {
                    delivery_person_id: deliveryPersonId,
                    payment_method: 'delivery',
                    payment_status: 'en_attente',
                    status: 'livree'
                }
            }
        );

        res.json({
            message: `Paiements confirmés pour ${updatedCount} commandes.`,
            count: updatedCount
        });
    } catch (error) {
        console.error('confirmCashRemitted error:', error);
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

        // Automatiquement passer le role en 'livreur' si validé
        const newRole = is_verified ? 'livreur' : 'user';
        const profile = await Profile.findByPk(deliveryPerson.user_id);
        if (profile) {
            await profile.update({ role: newRole });
        }

        res.json({ message: 'Statut mis à jour et rôle synchronisé' });
    } catch (error) {
        console.error('verifyLivreur error:', error);
        res.status(500).json({ error: 'Erreur lors de la vérification' });
    }
};

// Admin assigning an order to a delivery person
exports.adminAssignOrder = async (req, res) => {
    try {
        const { orderId, deliveryPersonId } = req.body;

        const order = await Order.findByPk(orderId);
        if (!order) return res.status(404).json({ error: 'Commande non trouvée' });

        // If deliveryPersonId is null, unassign the order
        if (!deliveryPersonId) {
            await order.update({ delivery_person_id: null, assigned_at: null });
            return res.json({ message: 'Livreur retiré de la commande', order });
        }

        const deliveryPerson = await DeliveryPerson.findByPk(deliveryPersonId);
        if (!deliveryPerson) return res.status(404).json({ error: 'Livreur non trouvé' });

        const updateData = {
            delivery_person_id: deliveryPerson.id,
            assigned_at: order.assigned_at || new Date()
        };

        // Seulement changer le statut à confirmée si elle était en attente
        if (order.status === 'en_attente') {
            updateData.status = 'confirmee';
        }

        await order.update(updateData);

        res.json({ message: 'Commande assignée par l\'administrateur', order });
    } catch (error) {
        console.error('adminAssignOrder error:', error);
        res.status(500).json({ error: 'Erreur lors de l\'assignation administrative' });
    }
};

// Register as delivery person (Initial setup)
exports.registerLivreur = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { vehicle_type, vehicle_model, license_plate, id_card_url, phone, fullname, service_zones } = req.body;

        const [deliveryPerson, created] = await DeliveryPerson.findOrCreate({
            where: { user_id: userId },
            defaults: {
                vehicle_type,
                vehicle_model,
                license_plate,
                id_card_url,
                service_zones: service_zones || [],
                is_verified: false
            }
        });

        if (!created) {
            await deliveryPerson.update({
                vehicle_type,
                vehicle_model,
                license_plate,
                id_card_url,
                service_zones: service_zones || [],
                is_verified: false
            });
        }

        // Update profile if phone or fullname is provided and missing/different
        const profile = await Profile.findByPk(userId);
        if (profile) {
            const updates = {};
            if (phone && profile.phone !== phone) updates.phone = phone;
            if (fullname && profile.fullname !== fullname) updates.fullname = fullname;
            if (Object.keys(updates).length > 0) {
                await profile.update(updates);
            }
        }

        res.json({ message: 'Demande d\'inscription envoyée. En attente de vérification.', deliveryPerson });
    } catch (error) {
        console.error('registerLivreur error:', error);
        res.status(500).json({ error: 'Erreur lors de l\'enregistrement' });
    }
};
