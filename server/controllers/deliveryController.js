import { DeliveryPerson, Order, Address, Profile, OrderItem, Product, ProductImage, Supplier, ProductVariant, sequelize } from '../models/index.js';
import { Op } from 'sequelize';
import { processOrderFinancials } from '../services/financialService.js';
import { notifyDelivererStatusUpdate, notifyAdmin, sendWhatsAppMessage } from '../services/whatsappService.js';
import { getDeliveryFeeTiers, computeDeliveryFee, getDeliveryMultiplierTiers, computeDeliveryMultiplier } from '../services/deliveryFeeService.js';
import { createFedapayTransaction } from '../services/fedapayService.js';

const sendLogisticsWhatsAppNotifications = async (orderId, type, details = {}) => {
    try {
        const order = await Order.findByPk(orderId, {
            include: [
                { model: Address, as: 'address' },
                { model: Supplier, as: 'supplier', include: [{ model: Profile, as: 'user' }] },
                { model: Profile, as: 'user' },
                { model: DeliveryPerson, as: 'deliveryPerson', include: [{ model: Profile, as: 'profile' }] }
            ]
        });

        if (!order) return;

        const customerPhone = order.whatsapp_notif_phone || order.guest_phone || order.user?.phone;
        const supplierPhone = order.supplier?.whatsapp || order.supplier?.phone || order.supplier?.user?.phone;
        const delivererPhone = order.deliveryPerson?.phone || order.deliveryPerson?.profile?.phone || order.deliveryPerson?.whatsapp;
        const delivererName = order.deliveryPerson?.profile?.fullname || 'Livreur';
        const supplierName = order.supplier?.name || 'Vendeur';
        
        const orderRef = order.id.slice(0, 8).toUpperCase();
        const amountStr = Number(order.total_amount).toLocaleString();

        if (type === 'assignToMe' || type === 'adminAssign') {
            // Deliverer assigned
            if (delivererPhone) {
                const supplierAddress = order.address ? `${order.address.commune_label || ''}, ${order.address.address_line || ''}` : '';
                await sendWhatsAppMessage(delivererPhone, `🛵 *VTOUT : Course assignée !*\nVous avez été assigné à la commande #${orderRef}.\nVeuillez récupérer le colis chez *${supplierName}* (${supplierPhone || ''}) pour livraison à : ${supplierAddress}.`).catch(() => {});
            }
            if (customerPhone) {
                await sendWhatsAppMessage(customerPhone, `🛵 *VTOUT : Livreur assigné !*\nVotre commande #${orderRef} a été prise en charge par le livreur *${delivererName}* (${delivererPhone || ''}). Il est en route.`).catch(() => {});
            }
            if (supplierPhone) {
                await sendWhatsAppMessage(supplierPhone, `🔔 *VTOUT : Livreur assigné !*\nLe livreur *${delivererName}* (${delivererPhone || ''}) a été assigné pour récupérer la commande #${orderRef}.\nVeuillez préparer le colis.`).catch(() => {});
            }
            await notifyAdmin(`🛵 *VTOUT : Course assignée*\nLivreur: *${delivererName}* (${delivererPhone || ''})\nCommande: #${orderRef}\nVendeur: *${supplierName}*`).catch(() => {});
        } else if (type === 'adminUnassign') {
            // Deliverer removed
            const prevPhone = details.prevPhone;
            if (prevPhone) {
                await sendWhatsAppMessage(prevPhone, `❌ *VTOUT : Course retirée*\nVous avez été retiré de la course #${orderRef}.`).catch(() => {});
            }
            if (customerPhone) {
                await sendWhatsAppMessage(customerPhone, `⚠️ *VTOUT : Changement de livreur*\nLe livreur précédemment assigné à votre commande #${orderRef} a été retiré. Un nouveau livreur sera bientôt assigné.`).catch(() => {});
            }
            if (supplierPhone) {
                await sendWhatsAppMessage(supplierPhone, `⚠️ *VTOUT : Changement de livreur*\nLe livreur pour la commande #${orderRef} a été retiré.`).catch(() => {});
            }
            await notifyAdmin(`❌ *VTOUT : Livreur retiré par l'admin*\nCommande: #${orderRef}`).catch(() => {});
        } else if (type === 'shipped') {
            // Shipped
            if (customerPhone) {
                await sendWhatsAppMessage(customerPhone, `📦 *VTOUT : Commande en route !*\nVotre commande #${orderRef} a été récupérée par le livreur et est en cours de livraison.`).catch(() => {});
            }
            if (supplierPhone) {
                await sendWhatsAppMessage(supplierPhone, `✅ *VTOUT : Commande récupérée !*\nLe livreur *${delivererName}* a récupéré le colis pour la commande #${orderRef}.`).catch(() => {});
            }
            await notifyAdmin(`🛵 *VTOUT : En transit*\nLa commande #${orderRef} a été récupérée par le livreur *${delivererName}* (${delivererPhone || ''}).`).catch(() => {});
        } else if (type === 'delivered') {
            // Delivered
            if (customerPhone) {
                await sendWhatsAppMessage(customerPhone, `🎉 *VTOUT : Commande livrée !*\nVotre commande #${orderRef} a été livrée avec succès. Merci pour votre achat !`).catch(() => {});
            }
            if (supplierPhone) {
                await sendWhatsAppMessage(supplierPhone, `🎉 *VTOUT : Commande livrée !*\nLa commande #${orderRef} a été livrée par *${delivererName}*. Vos gains ont été crédités.`).catch(() => {});
            }
            if (delivererPhone) {
                await sendWhatsAppMessage(delivererPhone, `💸 *VTOUT : Gain crédité !*\nVotre course #${orderRef} a été marquée comme livrée. Vos gains de livraison ont été crédités sur votre portefeuille.`).catch(() => {});
            }
            await notifyAdmin(`✅ *VTOUT : Commande livrée*\nLa commande #${orderRef} a été livrée avec succès par *${delivererName}* (${delivererPhone || ''}).`).catch(() => {});
        }
    } catch (e) {
        console.error("[WhatsApp Logs Helper] Error:", e);
    }
};


export const getAvailableOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: {
                status: { [Op.in]: ['confirmée', 'expédiée', 'expediee'] },
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

        const deliveryTiers = await getDeliveryFeeTiers();
        const multiplierTiers = await getDeliveryMultiplierTiers();
        const ordersJson = orders.map(order => {
            const orderJson = order.toJSON();
            let totalEmbeddedFees = 0;
            let totalQuantity = 0;
            if (orderJson.items) {
                for (const item of orderJson.items) {
                    const itemSupplierPrice = item.product?.supplier_price || 0;
                    const itemFee = computeDeliveryFee(itemSupplierPrice, deliveryTiers);
                    totalEmbeddedFees += itemFee * item.quantity;
                    totalQuantity += item.quantity;
                }
            }
            const multiplier = computeDeliveryMultiplier(totalQuantity, multiplierTiers);
            const geographicalFee = parseFloat(orderJson.delivery_fee || 0);
            const delivererFlatFee = totalQuantity > 0
                ? Math.round((totalEmbeddedFees / totalQuantity) * multiplier)
                : 0;
            orderJson.deliverer_fee = delivererFlatFee + geographicalFee;
            return orderJson;
        });

        res.json(ordersJson);
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
        if (!['confirmee', 'confirmée', 'en_attente', 'expediee', 'expédiée'].includes(order.status)) {
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

        const newStatus = ['expediee', 'expédiée'].includes(order.status) ? order.status : 'confirmée';
        await order.update({ delivery_person_id: deliveryPerson.id, assigned_at: new Date(), status: newStatus });
        
        // Notify all actors on assignment
        sendLogisticsWhatsAppNotifications(order.id, 'assignToMe').catch(err => console.error("Notification error:", err));

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

        // Notify all actors on status update from delivery
        if (mappedStatus === 'expédiée' && oldStatus !== 'expédiée') {
            sendLogisticsWhatsAppNotifications(order.id, 'shipped').catch(err => console.error("Notification error:", err));
        } else if (mappedStatus === 'livrée' && oldStatus !== 'livrée') {
            sendLogisticsWhatsAppNotifications(order.id, 'delivered').catch(err => console.error("Notification error:", err));
        }

        // Real-time socket notification to client so tracking page updates immediately
        if (req.io && order.user_id) {
            req.io.to(order.user_id).emit('order_status_updated', {
                orderId: order.id,
                status: mappedStatus,
                message: `Votre commande #${order.id.slice(0, 8).toUpperCase()} est maintenant ${mappedStatus}.`
            });
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
            where: {
                delivery_person_id: deliveryPerson.id,
                status: { [Op.notIn]: ['annulée', 'annulee', 'retournée', 'retournee'] }
            },
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

        const deliveryTiers = await getDeliveryFeeTiers();
        const multiplierTiers = await getDeliveryMultiplierTiers();
        const ordersJson = orders.map(order => {
            const orderJson = order.toJSON();
            let totalEmbeddedFees = 0;
            let totalQuantity = 0;
            if (orderJson.items) {
                for (const item of orderJson.items) {
                    const itemSupplierPrice = item.product?.supplier_price || 0;
                    const itemFee = computeDeliveryFee(itemSupplierPrice, deliveryTiers);
                    totalEmbeddedFees += itemFee * item.quantity;
                    totalQuantity += item.quantity;
                }
            }
            const multiplier = computeDeliveryMultiplier(totalQuantity, multiplierTiers);
            const geographicalFee = parseFloat(orderJson.delivery_fee || 0);
            const delivererFlatFee = totalQuantity > 0
                ? Math.round((totalEmbeddedFees / totalQuantity) * multiplier)
                : 0;
            orderJson.deliverer_fee = delivererFlatFee + geographicalFee;
            return orderJson;
        });

        res.json(ordersJson);
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

export const generateCashPaymentLink = async (req, res) => {
    try {
        const { orderId } = req.body;
        if (!orderId) return res.status(400).json({ error: 'orderId requis' });

        const deliveryPerson = await DeliveryPerson.findOne({ where: { user_id: req.auth.userId } });
        if (!deliveryPerson) return res.status(403).json({ error: 'Profil livreur introuvable' });

        const order = await Order.findOne({
            where: {
                id: orderId,
                delivery_person_id: deliveryPerson.id,
                payment_method: 'delivery',
                payment_status: 'en_attente',
                status: { [Op.in]: ['livrée', 'livree'] }
            },
            include: [{ model: Profile, as: 'user' }]
        });
        if (!order) return res.status(404).json({ error: 'Commande introuvable ou déjà soldée' });

        const totalAmount = parseFloat(order.total_amount || 0);
        const deliveryFee = parseFloat(order.delivery_fee || 0);
        const amountToReverse = Math.max(0, Math.round(totalAmount - deliveryFee));

        if (amountToReverse <= 0) return res.status(400).json({ error: 'Montant à reverser invalide' });

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const callbackUrl = `${frontendUrl}/delivery-rider/cash-success?order_id=${orderId}`;

        const livreurProfile = await Profile.findOne({ where: { id: req.auth.userId } });

        // Reuse the existing FedaPay service with a synthetic order object
        const syntheticOrder = {
            id: orderId,
            total_amount: amountToReverse,
            guest_name: livreurProfile?.fullname || 'Livreur',
            guest_email: livreurProfile?.email || 'livreur@vtout.com',
            guest_phone: deliveryPerson.whatsapp || '00000000',
        };
        const customer = {
            fullname: livreurProfile?.fullname || 'Livreur',
            email: livreurProfile?.email || 'livreur@vtout.com',
            phone: deliveryPerson.whatsapp || '00000000',
        };

        const result = await createFedapayTransaction(syntheticOrder, customer, callbackUrl, { type: 'reversement_cash' });

        // Tag the order with the reversement transaction id so the webhook can find it
        await order.update({ payment_id: String(result.transactionId) });

        res.json({
            checkoutUrl: result.checkoutUrl,
            amount: amountToReverse,
            transactionId: result.transactionId
        });
    } catch (error) {
        console.error('[generateCashPaymentLink]', error);
        res.status(500).json({ error: 'Erreur génération du lien de paiement' });
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
            // Capture previous deliverer phone before unassigning
            let prevPhone = null;
            if (order.delivery_person_id) {
                const prevDeliverer = await DeliveryPerson.findByPk(order.delivery_person_id, { include: [{ model: Profile, as: 'profile' }] });
                prevPhone = prevDeliverer?.phone || prevDeliverer?.profile?.phone || prevDeliverer?.whatsapp;
            }

            await order.update({ delivery_person_id: null, assigned_at: null });

            // Notify all actors on unassignment
            sendLogisticsWhatsAppNotifications(order.id, 'adminUnassign', { prevPhone }).catch(err => console.error("Notification error:", err));

            return res.json({ message: 'Livreur retiré de la commande', order });
        }

        const deliveryPerson = await DeliveryPerson.findByPk(deliveryPersonId);
        if (!deliveryPerson) return res.status(404).json({ error: 'Livreur non trouvé' });

        const updateData = { delivery_person_id: deliveryPerson.id, assigned_at: order.assigned_at || new Date() };
        if (order.status === 'en_attente') updateData.status = 'confirmée';

        await order.update(updateData);

        if (order.status === 'livrée' || order.status === 'livree') {
            try {
                await processOrderFinancials(order.id);
            } catch (finErr) {
                console.error("[Finance] Failed to process financials after admin assign:", finErr);
            }
        }

        // Notify all actors on assignment
        sendLogisticsWhatsAppNotifications(order.id, 'adminAssign').catch(err => console.error("Notification error:", err));

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