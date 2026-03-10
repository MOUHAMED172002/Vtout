const { Order, OrderItem, Product, Address, Cart, ProductVariant, ProductImage, ProductVariantPrice, Profile, DeliveryPerson, Supplier, SupplierProduct } = require('../models');
const crypto = require('crypto');
const { sendInvoiceEmail, sendOrderNotificationToAdmin, sendOrderUpdateToCustomer } = require('../services/mailService');

exports.getMyOrders = async (req, res) => {
    try {
        const userId = req.auth?.userId;
        console.log('[getMyOrders] Fetching orders for userId:', userId);
        if (!userId) {
            console.warn('[getMyOrders] No userId found in req.auth');
            return res.status(401).json({ error: 'Profil utilisateur non trouvé. Veuillez vous reconnecter.' });
        }

        const orders = await Order.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']]
        });
        console.log(`[getMyOrders] Found ${orders.length} orders for user ${userId}`);
        res.json(orders);
    } catch (error) {
        console.error('getMyOrders error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des commandes', details: error.message });
    }
};

exports.getMySupplierOrders = async (req, res) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: 'Non autorisé' });

        const supplier = await Supplier.findOne({ where: { user_id: userId } });
        if (!supplier) return res.status(404).json({ error: 'Fournisseur non trouvé' });

        const orders = await Order.findAll({
            where: { supplier_id: supplier.id },
            order: [['created_at', 'DESC']],
            include: [{ model: Address, as: 'address' }]
        });

        res.json(orders);
    } catch (error) {
        console.error('getMySupplierOrders error:', error);
        res.status(500).json({ error: 'Erreur Serveur' });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            order: [['created_at', 'DESC']],
            include: [{ model: Address, as: 'address' }]
        });
        res.json(orders);
    } catch (error) {
        console.error('getAllOrders error:', error);
        res.status(500).json({ error: 'Erreur serveur', details: error.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: 'Profil utilisateur non trouvé.' });

        const order = await Order.findOne({
            where: { id: req.params.id },
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            include: [{ model: ProductImage, as: 'images' }]
                        },
                        {
                            model: ProductVariant,
                            as: 'variant',
                            include: [{ model: ProductVariantPrice, as: 'priceRows' }]
                        }
                    ]
                },
                { model: Address, as: 'address' },
                {
                    model: DeliveryPerson,
                    as: 'deliveryPerson',
                    include: [{
                        model: Profile,
                        as: 'profile',
                        attributes: ['id', 'fullname', 'phone', 'avatar_url']
                    }]
                },
                {
                    model: Supplier,
                    as: 'supplier'
                }
            ]
        });

        if (!order) return res.status(404).json({ error: 'Commande non trouvée' });
        res.json(order);
    } catch (error) {
        console.error('getOrderById error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de la commande', details: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status, payment_id, payment_status, supplier_id } = req.body;
        const updateData = { status };
        if (payment_id) updateData.payment_id = payment_id;
        if (payment_status) updateData.payment_status = payment_status;
        if (supplier_id) updateData.supplier_id = supplier_id;

        // Auto-record delivery date if status changes to 'livree'
        if (status === 'livree') {
            updateData.delivered_at = new Date();
        }

        await Order.update(updateData, { where: { id: req.params.id } });

        // Conditional Email Invoice Logic
        const triggerEmail = async () => {
            try {
                const order = await Order.findOne({
                    where: { id: req.params.id },
                    include: [{
                        model: OrderItem,
                        as: 'items',
                        include: [{ model: Product, as: 'product' }]
                    }]
                });

                if (!order || order.invoice_sent) return;

                const shouldSend =
                    (order.payment_status === 'payé') ||
                    (order.status === 'livree' && order.payment_method === 'delivery');

                if (shouldSend) {
                    let recipientEmail = order.guest_email;
                    let recipientName = order.guest_name;

                    if (order.user_id && !recipientEmail) {
                        const profile = await Profile.findByPk(order.user_id);
                        recipientEmail = profile?.email;
                        recipientName = profile?.fullname;
                    }

                    if (recipientEmail) {
                        const mailResult = await sendInvoiceEmail({
                            ...order.toJSON(),
                            guest_email: recipientEmail,
                            guest_name: recipientName || 'Client'
                        }, order.items);

                        if (mailResult?.success) {
                            await Order.update({ invoice_sent: true }, { where: { id: order.id } });
                        }
                    }
                }
            } catch (err) {
                console.error('Error in conditional email trigger:', err);
            }
        };

        if (status) {
            const order = await Order.findByPk(req.params.id);
            if (order) {
                const statusLabels = {
                    'en_attente': 'En attente',
                    'confirmee': 'Confirmée',
                    'en_cours': 'En cours de préparation',
                    'expediee': 'Expédiée / En livraison',
                    'livree': 'Livrée',
                    'annulee': 'Annulée'
                };
                sendOrderUpdateToCustomer(order, statusLabels[status] || status);
            }
        }

        triggerEmail(); // Run in background

        res.json({ message: 'Commande mise à jour avec succès' });
    } catch (error) {
        console.error('UpdateOrderStatus error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

exports.createOrder = async (req, res) => {
    try {
        const userId = req.auth?.userId || null;
        const { total_amount, status, payment_method, address_id, items, guest_name, guest_email, guest_phone } = req.body;

        console.log(`[createOrder] Attempt: Guest=${!userId}, Total=${total_amount}`);

        // Validate: either a logged-in user or guest info must be provided
        if (!userId && !guest_email) {
            return res.status(400).json({ error: 'Informations de contact requises pour les invités' });
        }

        const itemsCount = items ? items.reduce((acc, it) => acc + (it.quantity || 1), 0) : 0;

        console.log(`[createOrder] Creating record...`);
        let orderId;
        try {
            orderId = crypto.randomUUID();
        } catch (e) {
            orderId = require('crypto').randomBytes(16).toString('hex'); // Fallback safe for node
        }

        const order = await Order.create({
            id: orderId,
            user_id: userId,
            guest_name: guest_name || null,
            guest_email: guest_email || null,
            guest_phone: guest_phone || null,
            total_amount,
            status: status || 'en_attente',
            payment_method,
            address_id,
            items_count: itemsCount,
            payment_status: 'en_attente'
        });

        console.log(`[createOrder] Order created: ${order.id}. Inserting ${items?.length} items...`);

        if (items && items.length > 0) {
            const itemsPayload = items.map((it, idx) => {
                if (!it.product_id) {
                    throw new Error(`Item ${idx} is missing product_id`);
                }
                return {
                    product_id: it.product_id,
                    variant_id: it.variant_id || null,
                    quantity: it.quantity || 1,
                    price: it.price || 0,
                    order_id: order.id
                };
            });
            await OrderItem.bulkCreate(itemsPayload);
            console.log(`[createOrder] Item insertion successful`);
        }

        // Clear Cart only for registered users
        if (userId) {
            console.log(`[createOrder] Clearing cart for user ${userId}...`);
            await Cart.destroy({ where: { user_id: userId } });
        }

        console.log(`[createOrder] Success: Order ${order.id}`);

        // Notify admin (background)
        sendOrderNotificationToAdmin(order).catch(e => console.error('Admin notify fail:', e));

        res.status(201).json(order);
    } catch (error) {
        console.error('CRITICAL createOrder error:', error);
        res.status(500).json({
            error: 'Erreur lors de la création de la commande',
            details: error.message,
            stack: error.stack
        });
    }
};

exports.getSuggestedSuppliers = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findByPk(id, {
            include: [
                { model: OrderItem, as: 'items' },
                { model: Address, as: 'address' }
            ]
        });

        if (!order) return res.status(404).json({ error: 'Commande non trouvée' });

        const productIds = order.items.map(it => it.product_id);
        const suppliers = await Supplier.findAll({
            include: [{
                model: SupplierProduct,
                as: 'suppliedProducts',
                where: { product_id: productIds },
                required: true
            }]
        });

        // Geolocation sorting
        const addr = order.address || {};
        const scoredSuppliers = suppliers.map(s => {
            let score = 0;
            if (s.quartier_id === addr.quartier_id) score += 10;
            else if (s.commune_id === addr.commune_id) score += 5; // else if to avoid double counting if string format differs, but typically IDs match exactly. Let's just do independent.
            else if (s.departement_id === addr.departement_id) score += 2;

            const data = s.toJSON();
            data.matchScore = score;
            return data;
        });

        const sorted = scoredSuppliers.sort((a, b) => b.matchScore - a.matchScore);
        res.json(sorted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la recherche des fournisseurs' });
    }
};

exports.assignSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const { supplier_id } = req.body;
        await Order.update({ supplier_id }, { where: { id } });
        res.json({ message: 'Fournisseur assigné' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l’assignation' });
    }
};
