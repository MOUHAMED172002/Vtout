const { Order, OrderItem, Product, Address, Cart, ProductVariant, ProductImage, ProductVariantPrice, Profile, DeliveryPerson, Supplier, SupplierProduct } = require('../models');
const crypto = require('crypto');
const { sendInvoiceEmail, sendOrderNotificationToAdmin, sendOrderUpdateToCustomer } = require('../services/mailService');

exports.getMyOrders = async (req, res) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: 'Profil utilisateur non trouvé. Veuillez vous reconnecter.' });

        const orders = await Order.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
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
        res.status(500).json({ error: 'Erreur Serveur' });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            order: [['created_at', 'DESC']],
            include: [
                { model: Profile, as: 'user', attributes: ['fullname', 'email'] },
                { model: Address, as: 'address' },
                { model: DeliveryPerson, as: 'deliveryPerson', include: [{ model: Profile, as: 'profile', attributes: ['fullname'] }] }
            ]
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Erreur Serveur', details: error.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findByPk(id, {
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    include: [
                        { model: Product, as: 'product', include: [{ model: ProductImage, as: 'images', where: { is_main: true }, required: false }] },
                        { model: ProductVariant, as: 'variant' }
                    ]
                },
                { model: Address, as: 'address' },
                { model: Profile, as: 'user', attributes: ['fullname', 'email', 'phone'] },
                { model: Supplier, as: 'supplier', attributes: ['name', 'address', 'phone'] },
                { model: DeliveryPerson, as: 'deliveryPerson', include: [{ model: Profile, as: 'profile', attributes: ['fullname', 'phone'] }] }
            ]
        });
        if (!order) return res.status(404).json({ error: 'Commande non trouvée' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Erreur Serveur', details: error.message });
    }
};

exports.createOrder = async (req, res) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: 'Non autorisé' });

        const { items, address_id, payment_method, notes, delivery_fee } = req.body;
        if (!items || items.length === 0) return res.status(400).json({ error: 'Le panier est vide' });

        let subtotal = 0;
        const enrichedItems = [];

        for (const item of items) {
            const product = await Product.findByPk(item.product_id);
            if (!product) return res.status(404).json({ error: `Produit ${item.product_id} non trouvé` });

            let unitPrice = parseFloat(product.price || 0);
            let variantData = null;

            if (item.variant_price_id) {
                const variantPrice = await ProductVariantPrice.findByPk(item.variant_price_id, {
                    include: [{ model: ProductVariant, as: 'variant' }]
                });
                if (variantPrice) {
                    unitPrice = parseFloat(variantPrice.price || unitPrice);
                    variantData = variantPrice;
                }
            }

            subtotal += unitPrice * item.quantity;
            enrichedItems.push({ product, item, unitPrice, variantData });
        }

        const deliveryCode = Math.floor(1000 + Math.random() * 9000).toString();
        const totalAmount = subtotal + parseFloat(delivery_fee || 0);

        // Trouver le fournisseur le plus proche (1er item)
        let supplierId = null;
        const firstProduct = enrichedItems[0]?.product;
        if (firstProduct) {
            const sp = await SupplierProduct.findOne({ where: { product_id: firstProduct.id } });
            if (sp) supplierId = sp.supplier_id;
        }

        const order = await Order.create({
            user_id: userId,
            address_id,
            payment_method: payment_method || 'delivery',
            payment_status: payment_method === 'card' ? 'payé' : 'en_attente',
            status: 'en_attente',
            total_amount: totalAmount,
            delivery_fee: delivery_fee || 0,
            notes,
            delivery_code: deliveryCode,
            supplier_id: supplierId
        });

        for (const { product, item, unitPrice, variantData } of enrichedItems) {
            await OrderItem.create({
                order_id: order.id,
                product_id: product.id,
                variant_id: variantData?.variant_id || null,
                variant_price_id: variantData?.id || null,
                quantity: item.quantity,
                unit_price: unitPrice,
                subtotal: unitPrice * item.quantity
            });
        }

        await Cart.destroy({ where: { user_id: userId } });

        try {
            await sendOrderNotificationToAdmin(order, enrichedItems.map(e => e.product));
        } catch (_) {}
        try {
            await sendInvoiceEmail(order, enrichedItems.map(e => ({ ...e.item, product: e.product, unit_price: e.unitPrice })));
        } catch (_) {}

        res.status(201).json({ message: 'Commande créée', order, delivery_code: deliveryCode });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la création de la commande', details: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await Order.findByPk(id);
        if (!order) return res.status(404).json({ error: 'Commande non trouvée' });

        await order.update({ status });

        try {
            const userProfile = await Profile.findByPk(order.user_id);
            if (userProfile?.email) {
                await sendOrderUpdateToCustomer(order, userProfile.email, status);
            }
        } catch (_) {}

        res.json({ message: 'Statut mis à jour', order });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour', details: error.message });
    }
};

exports.getOrderDeliveryCode = async (req, res) => {
    try {
        const userId = req.auth?.userId;
        const { id } = req.params;

        const order = await Order.findOne({ where: { id, user_id: userId } });
        if (!order) return res.status(404).json({ error: 'Commande non trouvée' });

        res.json({ delivery_code: order.delivery_code });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
