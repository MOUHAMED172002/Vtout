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

        if (!userId && !guest_email) {
            return res.status(400).json({ error: 'Informations de contact requises pour les invités' });
        }

        const orderId = crypto.randomUUID();
        const itemsCount = items ? items.reduce((acc, it) => acc + (it.quantity || 1), 0) : 0;

        // 1. Create the Master Order
        const masterOrder = await Order.create({
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
            payment_status: 'en_attente',
            is_parent: true
        });

        // 2. Fetch all products to group by supplier
        if (items && items.length > 0) {
            const productIds = items.map(it => it.product_id);
            const products = await Product.findAll({ where: { id: productIds } });
            
            // Map supplier_id to items
            const supplierGroups = {};
            items.forEach(it => {
                const prod = products.find(p => p.id === it.product_id);
                const sId = prod?.supplier_id || 'admin';
                if (!supplierGroups[sId]) supplierGroups[sId] = [];
                supplierGroups[sId].push(it);
            });

            // 3. Create Sub-Orders for EACH supplier
            for (const [sId, groupItems] of Object.entries(supplierGroups)) {
                const subOrderId = crypto.randomUUID();
                const subTotal = groupItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
                
                const subOrder = await Order.create({
                    id: subOrderId,
                    user_id: userId,
                    guest_name: guest_name || null,
                    guest_email: guest_email || null,
                    guest_phone: guest_phone || null,
                    total_amount: subTotal,
                    status: 'en_attente',
                    payment_method,
                    address_id,
                    items_count: groupItems.length,
                    payment_status: 'en_attente',
                    supplier_id: sId === 'admin' ? null : sId,
                    parent_id: masterOrder.id,
                    is_parent: false
                });

                // Insert items for this sub-order
                const itemsPayload = groupItems.map(it => ({
                    product_id: it.product_id,
                    variant_id: it.variant_id || null,
                    quantity: it.quantity || 1,
                    price: it.price || 0,
                    order_id: subOrder.id
                }));
                await OrderItem.bulkCreate(itemsPayload);
            }
        }

        if (userId) await Cart.destroy({ where: { user_id: userId } });

        sendOrderNotificationToAdmin(masterOrder).catch(e => console.error('Admin notify fail:', e));
        res.status(201).json(masterOrder);
    } catch (error) {
        console.error('CRITICAL createOrder error:', error);
        res.status(500).json({ error: 'Erreur lors de la création de la commande', details: error.message });
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

exports.getSuggestedLivreurs = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findByPk(id, {
            include: [{ model: Address, as: 'address' }]
        });

        if (!order) return res.status(404).json({ error: 'Commande non trouvée' });

        const livreurs = await DeliveryPerson.findAll({
            where: { status: 'disponible', is_active: true },
            include: [{ model: Profile, as: 'profile', attributes: ['fullname', 'phone', 'avatar_url'] }]
        });

        const addr = order.address || {};
        const scored = livreurs.map(l => {
            let score = 0;
            const zones = l.service_zones || [];
            
            // Check if client address in zones
            if (addr.commune_label && zones.includes(addr.commune_label)) score += 10;
            if (addr.departement_label && zones.includes(addr.departement_label)) score += 5;

            const data = l.toJSON();
            data.matchScore = score;
            return data;
        });

        res.json(scored.sort((a, b) => b.matchScore - a.matchScore));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur suggestion livreurs' });
    }
};
