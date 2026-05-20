import { DeliveryPerson, Order, Address, Profile, OrderItem, Product, ProductImage, Supplier, ProductVariant, sequelize } from '../models/index.js';
import { Op } from 'sequelize';
import { processOrderFinancials } from '../services/financialService.js';
import { notifyDelivererStatusUpdate, notifyAdmin } from '../services/whatsappService.js';


export const getAvailableOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: {
                status: { [Op.in]: ['confirmée'] },
                delivery_person_id: null,
                supplier_id: { [Op.not]: null }
            },
            include: [
                { model: Address, as: 'address' },
                { model: Supplier, as: 'supplier' },
                { model: Profile, as: 'user', attributes: ['fullname'] }, // Only show name, keep phone/email hidden until assignment

                {
                    model: OrderItem, as: 'items',
                    include: [
                        {
                            model: Product, as: 'product',
                            include: [{ model: ProductImage, as: 'images', where: { is_main: true }, required: false }]
                        },
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

export const assignToMe = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { orderId } = req.body;

        const deliveryPerson = await DeliveryPerson.findOne({ where: { user_id: userId } });
        if (!deliveryPerson) return res.status(403).json({ error: 'Vous n\'êtes pas enregistré comme livreur' });

        // SECURITE : S'assurer que le livreur est vérifié
        if (!deliveryPerson.is_verified) return res.status(403).json({ error: 'Votre compte livreur est en attente de validation.' });

        const order = await Order.findByPk(orderId);
        if (!order) return res.status(404).json({ error: 'Commande non trouvée' });
        if (order.delivery_person_id) return res.status(400).json({ error: 'Commande déjà assignée' });

        // SECURITE : Vérifier que la commande est valide pour l'assignation
        if (!['confirmee', 'confirmée', 'en_attente'].includes(order.status)) {
            return res.status(400).json({ error: 'Cette commande n\'est plus disponible.' });
        }

        const unremittedCashCount = await Order.count({
            where: {
                delivery_person_id: deliveryPerson.id,
                status: 'livrée',
                payment_method: 'delivery',
                payment_status: 'en_attente'
            }
        });

        if (unremittedCashCount > 0) {
            return res.status(403).json({
                error: "Dette active : Veuillez d'abord remettre l'argent des livraisons complétées à l'administrateur afin de prendre une nouvelle course."
            });
        }

        await order.update({ delivery_person_id: deliveryPerson.id, assigned_at: new Date(), status: 'confirmée' });
        res.json({ message: 'Commande assignée avec succès', order });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l\'assignation de la commande' });
    }
};

export const releaseOrder = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { orderId } = req.body;

        const deliveryPerson = await DeliveryPerson.findOne({ where: { user_id: userId } });
        if (!deliveryPerson) return res.status(403).json({ error: 'Vous n\'êtes pas enregistré comme livreur' });

        const order = await Order.findOne({ where: { id: orderId, delivery_person_id: deliveryPerson.id } });
        if (!order) return res.status(404).json({ error: 'Commande non trouvée' });
        if (!['confirmee', 'confirmée', 'assignee', 'assignée'].includes(order.status)) return res.status(400).json({ error: 'Impossible de désassigner une commande déjà expédiée ou livrée' });

        await order.update({ delivery_person_id: null, assigned_at: null });
        res.json({ message: 'Commande désassignée avec succès', order });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la désassignation de la commande' });
    }
};

export const updateDeliveryStatus = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { orderId, status, delivery_code, proof_url } = req.body;

        const STATUS_MAP = {
            'livree': 'livrée',
            'expediee': 'expédiée',
            'confirmee': 'confirmée',
            'assignee': 'assignée'
        };
        const mappedStatus = STATUS_MAP[status] || status;

        const deliveryPerson = await DeliveryPerson.findOne({ where: { user_id: userId } });
        const order = await Order.findOne({ where: { id: orderId, delivery_person_id: deliveryPerson?.id } });
        if (!order) return res.status(404).json({ error: 'Commande assignée non trouvée' });

        const oldStatus = order.status;
        const updateData = { status: mappedStatus };
        if (proof_url) updateData.proof_url = proof_url;

        if (mappedStatus === 'expédiée') {
            updateData.picked_up_at = new Date();
        }

        if (mappedStatus === 'livrée') {
            // SECURITE CRITIQUE : Toujours exiger le code de livraison
            if (order.delivery_code && order.delivery_code !== delivery_code) {
                console.error(`[FRAUDE POSSIBLE] Delivery code mismatch for order ${order.id}. Expected ${order.delivery_code}, got ${delivery_code}.`);
                return res.status(400).json({ error: 'Code de livraison invalide. Impossible de confirmer la livraison.' });
            }
            updateData.delivered_at = new Date();
            await deliveryPerson.increment('total_deliveries');
        }

        await order.update(updateData);

        const isDelivered = (mappedStatus === 'livrée') && (oldStatus !== 'livrée');
        if (isDelivered) {
            try {
                await processOrderFinancials(order);
            } catch (financialErr) {
                console.error(`[ROLLBACK] processOrderFinancials failed for order ${order.id}, reverting status:`, financialErr);
                await order.update({ status: oldStatus });
                return res.status(500).json({ error: 'Erreur lors du traitement financier. Le statut a été restauré. Veuillez réessayer.' });
            }
        }

        res.json({ message: 'Statut mis à jour', order });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
    }
};

export const getMyDeliveries = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const deliveryPerson = await DeliveryPerson.findOne({ where: { user_id: userId } });
        if (!deliveryPerson) return res.json([]);

        const orders = await Order.findAll({
            where: { delivery_person_id: deliveryPerson.id },
            include: [
                { model: Address, as: 'address' },
                { model: Supplier, as: 'supplier' },
                { model: Profile, as: 'user', attributes: ['fullname', 'email', 'phone'] },
                {
                    model: OrderItem, as: 'items',
                    include: [
                        {
                            model: Product, as: 'product',
                            include: [{ model: ProductImage, as: 'images', where: { is_main: true }, required: false }]
                        },
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

export const toggleStatus = async (req, res) => {
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

export const updateLocation = async (req, res) => {
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

export const updateServiceZones = async (req, res) => {
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

export const getMyProfile = async (req, res) => {
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

export const getLivreursList = async (req, res) => {
    try {
        const livreurs = await DeliveryPerson.findAll({
            include: [{ model: Profile, as: 'profile', attributes: ['id', 'fullname', 'email', 'phone'] }]
        });
        res.json(livreurs);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des livreurs' });
    }
};

export const getDeliveryStatsAdmin = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const debts = await Order.findAll({
            where: { payment_method: 'delivery', payment_status: 'en_attente', status: 'livrée', delivery_person_id: { [Op.ne]: null } },
            attributes: [
                'delivery_person_id',
                [sequelize.fn('SUM', sequelize.col('Order.total_amount')), 'total_debt'],
                [sequelize.fn('COUNT', sequelize.col('Order.id')), 'order_count']
            ],
            group: ['Order.delivery_person_id'],
            include: [{ model: DeliveryPerson, as: 'deliveryPerson', include: [{ model: Profile, as: 'profile', attributes: ['fullname'] }] }]
        });

        const dailyDeliveries = await Order.findAll({
            where: { status: 'livrée', updated_at: { [Op.gte]: today }, delivery_person_id: { [Op.ne]: null } },
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

export const confirmCashRemitted = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { deliveryPersonId } = req.body;
        if (!deliveryPersonId) {
            await t.rollback();
            return res.status(400).json({ error: 'ID du livreur requis' });
        }

        const lp = await DeliveryPerson.findByPk(deliveryPersonId, { transaction: t });
        if (!lp) {
            await t.rollback();
            return res.status(404).json({ error: 'Livreur non trouvé' });
        }

        const orders = await Order.findAll({
            where: { delivery_person_id: deliveryPersonId, payment_method: 'delivery', payment_status: 'en_attente', status: 'livrée' },
            transaction: t
        });

        if (orders.length === 0) {
            await t.rollback();
            return res.json({ message: "Aucune commande en attente de versement.", count: 0 });
        }

        for (const order of orders) {
            await order.update({ payment_status: 'payé' }, { transaction: t });
        }

        await t.commit();
        res.json({ message: `Paiements confirmés pour ${orders.length} commandes.`, count: orders.length });
    } catch (error) {
        await t.rollback();
        console.error("confirmCashRemitted error:", error);
        res.status(500).json({ error: 'Erreur lors de la confirmation du versement' });
    }
};

export const verifyLivreur = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_verified } = req.body;

        const deliveryPerson = await DeliveryPerson.findByPk(id);
        if (!deliveryPerson) return res.status(404).json({ error: 'Livreur non trouvé' });

        await deliveryPerson.update({ is_verified });

        const profile = await Profile.findByPk(deliveryPerson.user_id);
        if (profile) {
            const newRole = is_verified ? 'livreur' : 'user';
            await profile.update({ role: newRole });
            await sequelize.query(
                'UPDATE user SET role = :role WHERE id = :id',
                {
                    replacements: { role: newRole, id: deliveryPerson.user_id },
                    type: sequelize.QueryTypes.UPDATE
                }
            );
        }
        
        // WhatsApp Notification
        const phone = deliveryPerson.phone || profile?.phone;
        if (phone) {
            notifyDelivererStatusUpdate(phone, is_verified).catch(err => 
                console.error('Failed to send WhatsApp deliverer notification:', err)
            );
        }

        res.json({ message: 'Statut mis à jour et rôle synchronisé' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la vérification' });
    }
};

export const deleteLivreur = async (req, res) => {
    try {
        const { id } = req.params;
        const deliveryPerson = await DeliveryPerson.findByPk(id);
        if (!deliveryPerson) return res.status(404).json({ error: 'Livreur non trouvé' });

        const profile = await Profile.findByPk(deliveryPerson.user_id);
        if (profile && profile.role === 'livreur') {
            await profile.update({ role: 'user' });
            await sequelize.query(
                'UPDATE user SET role = :role WHERE id = :id',
                {
                    replacements: { role: 'user', id: deliveryPerson.user_id },
                    type: sequelize.QueryTypes.UPDATE
                }
            );
        }

        await deliveryPerson.destroy();
        res.json({ message: 'Demande/Profil livreur supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la suppression', details: error.message });
    }
};

export const adminAssignOrder = async (req, res) => {
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
        if (order.status === 'en_attente') updateData.status = 'confirmée';

        await order.update(updateData);
        res.json({ message: 'Commande assignée par l\'administrateur', order });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l\'assignation administrative' });
    }
};

export const registerLivreur = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { vehicle_type, vehicle_model, license_plate, id_card_url, phone, fullname, service_zones } = req.body;

        const [deliveryPerson, created] = await DeliveryPerson.findOrCreate({
            where: { user_id: userId },
            defaults: { vehicle_type, vehicle_model, license_plate, id_card_url, service_zones: service_zones || [], is_verified: false }
        });

        if (!created) {
            await deliveryPerson.update({ vehicle_type, vehicle_model, license_plate, id_card_url, service_zones: service_zones || [] });
        }

        const profile = await Profile.findByPk(userId);
        if (profile) {
            const updates = {};
            if (phone && profile.phone !== phone) updates.phone = phone;
            if (fullname && profile.fullname !== fullname) updates.fullname = fullname;
            try {
                if (Object.keys(updates).length > 0) {
                    await profile.update(updates);
                }
            } catch (err) {
                if (err.name === 'SequelizeUniqueConstraintError') {
                    return res.status(400).json({ error: "Ce numéro de téléphone est déjà utilisé par un autre utilisateur." });
                }
                throw err;
            }
        }

        res.json({ message: 'Demande d\'inscription envoyée. En attente de vérification.', deliveryPerson });
        
        // Notify Admin
        notifyAdmin(`🛵 *Nouveau Livreur !*\n${fullname || 'Un utilisateur'} vient de s'inscrire comme livreur.\nNuméro : ${phone || 'Inconnu'}`).catch(() => {});
    } catch (error) {
        console.error("REGISTER LIVREUR ERROR:", error);
        res.status(500).json({ error: 'Erreur lors de l\'enregistrement', details: error.message });
    }
};