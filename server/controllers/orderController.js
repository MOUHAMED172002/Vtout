import { Op } from 'sequelize';
import { Order, OrderItem, Product, Address, Cart, ProductVariant, ProductImage, ProductVariantPrice, Profile, DeliveryPerson, Supplier, SupplierProduct, FinancialTransaction, Config, SupportMessage, Boutique, Coupon } from '../models/index.js';
import { getRoadDistance, calculateDeliveryFee } from '../services/distanceService.js';
import { sendInvoiceEmail, sendOrderNotificationToAdmin, sendOrderUpdateToCustomer } from '../services/mailService.js';
import { processOrderFinancials } from '../services/financialService.js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { createFedapayTransaction } from '../services/fedapayService.js';


export const getMyOrders = async (req, res) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: 'Profil utilisateur non trouvé. Veuillez vous reconnecter.' });

        const orders = await Order.findAll({
            where: { user_id: userId },
            order: [[sequelize.literal('created_at'), 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des commandes', details: error.message });
    }
};

export const getMySupplierOrders = async (req, res) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: 'Non autorisé' });

        const supplier = await Supplier.findOne({ where: { user_id: userId } });
        if (!supplier) return res.json([]); // Return empty array instead of 404

        const orders = await Order.findAll({
            where: { supplier_id: supplier.id },
            order: [[sequelize.literal('created_at'), 'DESC']],
            include: [
                { model: Address, as: 'address' },
                { 
                    model: OrderItem, 
                    as: 'items',
                    include: [{ model: Product, as: 'product', attributes: ['name', 'price', 'supplier_price'] }] 
                }
            ]
        });
        res.json(orders);
    } catch (error) {
        console.error("GET MY SUPPLIER ORDERS ERROR:", error);
        res.status(500).json({ error: 'Erreur Serveur', details: error.message });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            order: [[sequelize.literal('created_at'), 'DESC']],
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

export const getOrderById = async (req, res) => {
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
                { model: Supplier, as: 'supplier', attributes: ['name', 'address_line', 'phone'] },
                { model: DeliveryPerson, as: 'deliveryPerson', include: [{ model: Profile, as: 'profile', attributes: ['fullname', 'phone'] }] }
            ]
        });

        if (!order) return res.status(404).json({ error: 'Commande non trouvée' });

        // Security check: Only owner or admin can see the order
        // Note: For guest orders (order.user_id is null), we might want to check against session, 
        // but for now let's just allow it if it exists or add a more complex check later.
        if (order.user_id && order.user_id !== req.auth?.userId && req.auth?.role !== 'admin') {
            return res.status(403).json({ error: 'Accès non autorisé à cette commande' });
        }

        res.json(order.toJSON());
    } catch (error) {
        console.error("GET ORDER ERROR:", error);
        res.status(500).json({ error: 'Erreur Serveur', details: error.message });
    }
};

export const createOrder = async (req, res) => {
    try {
        const userId = req.auth?.userId || null;

        const { items, address_id, payment_method, notes, delivery_fee, guest_name, guest_email, guest_phone, coupon_code } = req.body;
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
                    // Security check: ensure variant belongs to the product
                    if (variantPrice.variant.product_id !== product.id) {
                        return res.status(400).json({ error: `La variante ne correspond pas au produit ${product.name}` });
                    }
                    unitPrice = parseFloat(variantPrice.price || unitPrice);
                    variantData = variantPrice;
                }
            }

            subtotal += unitPrice * item.quantity;
            enrichedItems.push({ product, item, unitPrice, variantData });
        }

        // Group items by supplier
        const itemsBySupplier = {};
        for (const { product, item, unitPrice, variantData } of enrichedItems) {
            // Priority 1: Direct supplier_id on Product
            // Priority 2: SupplierProduct mapping (fallback)
            let sId = product.supplier_id;
            
            if (!sId) {
                const sp = await SupplierProduct.findOne({ where: { product_id: product.id } });
                sId = sp?.supplier_id || 'no_supplier';
            }
            
            if (!itemsBySupplier[sId]) itemsBySupplier[sId] = [];
            itemsBySupplier[sId].push({ product, item, unitPrice, variantData });
        }

        const supplierIds = Object.keys(itemsBySupplier);
        const customerAddress = address_id ? await Address.findByPk(address_id) : null;
        const createdOrders = [];
        
        // --- Coupon Logic ---
        let totalDiscount = 0;
        let validatedCoupon = null;
        if (coupon_code) {
            const now = new Date();
            validatedCoupon = await Coupon.findOne({
                where: {
                    code: coupon_code,
                    active: true,
                    start_date: { [Op.lte]: now },
                    end_date: { [Op.gte]: now }
                }
            });
            
            if (validatedCoupon) {
                if (!validatedCoupon.usage_limit || validatedCoupon.used_count < validatedCoupon.usage_limit) {
                    if (subtotal >= parseFloat(validatedCoupon.min_order_amount)) {
                        if (validatedCoupon.discount_type === 'percentage') {
                            totalDiscount = (subtotal * parseFloat(validatedCoupon.discount_value)) / 100;
                        } else {
                            totalDiscount = parseFloat(validatedCoupon.discount_value);
                        }
                        totalDiscount = Math.min(totalDiscount, subtotal);
                    }
                }
            }
        }

        for (const sId of supplierIds) {
            const supplierItems = itemsBySupplier[sId];
            const actualSupplierId = sId === 'no_supplier' ? null : sId;
            
            let sSubtotal = 0;
            supplierItems.forEach(si => { sSubtotal += si.unitPrice * si.item.quantity; });
            
            // Calcul forfaitaire des frais de livraison : 1000 F par commande
            let sDeliveryFee = 1000; 
            console.log(`[Delivery] Supplier: ${actualSupplierId}, Fixed Fee: ${sDeliveryFee}`);
            
            
            const deliveryCode = Math.floor(1000 + Math.random() * 9000).toString();

            // Distribute discount proportionally if multiple suppliers
            const orderId = crypto.randomUUID();
            
            // Pro-rate discount for this specific order
            const orderShareOfSubtotal = subtotal > 0 ? (sSubtotal / subtotal) : 1;
            const sDiscount = totalDiscount * orderShareOfSubtotal;
            const sTotal = (sSubtotal - sDiscount) + sDeliveryFee;

            const order = await Order.create({
                id: orderId,
                user_id: userId || null,
                guest_name,
                guest_email,
                guest_phone,
                address_id,
                payment_method: payment_method || 'delivery',
                payment_status: payment_method === 'card' ? 'payé' : 'en_attente',
                status: 'en_attente',
                total_amount: sTotal,
                delivery_fee: sDeliveryFee,
                discount_amount: sDiscount,
                coupon_code: sDiscount > 0 ? coupon_code : null,
                notes,
                delivery_code: deliveryCode,
                supplier_id: actualSupplierId,
                items_count: supplierItems.length
            });

            for (const { product, item, unitPrice, variantData } of supplierItems) {
                await OrderItem.create({
                    order_id: order.id,
                    product_id: product.id,
                    variant_id: variantData?.variant_id || null,
                    quantity: item.quantity,
                    price: unitPrice
                });
            }
            createdOrders.push(order);
        }

        if (userId) {
            await Cart.destroy({ where: { user_id: userId } });
        }

        if (validatedCoupon && totalDiscount > 0) {
            await validatedCoupon.increment('used_count', { by: 1 });
        }

        const mainOrder = createdOrders[0];
        let totalCartAmount = createdOrders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);

        try {
            await sendOrderNotificationToAdmin(mainOrder, enrichedItems.map(e => e.product));
        } catch (_) {}
        try {
            await sendInvoiceEmail(mainOrder, enrichedItems.map(e => ({ ...e.item, product: e.product, unit_price: e.unitPrice })));
        } catch (_) {}

        // Handle FedaPay if selected
        if (payment_method === 'fedapay' || payment_method === 'mobile_money' || payment_method === 'card') {
            try {
                let customerProfile = null;
                if (userId) {
                    customerProfile = await Profile.findByPk(userId);
                }
                const redirectUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/api/payments/fedapay-callback`;
                
                // We pass a dummy order object with the total cart amount to FedaPay
                const fedapayOrderObj = { ...mainOrder.toJSON(), total_amount: totalCartAmount };
                // Include all order IDs in metadata to update them all in Webhook if needed
                fedapayOrderObj.id = createdOrders.map(o => o.id).join(','); 

                const fedaTx = await createFedapayTransaction(fedapayOrderObj, customerProfile, redirectUrl);
                
                return res.status(201).json({
                    message: 'Commande créée (Paiement Requis)',
                    order: mainOrder.toJSON(),
                    delivery_code: mainOrder.delivery_code,
                    payment_url: fedaTx.checkoutUrl,
                    transaction_id: fedaTx.transactionId,
                    token: fedaTx.token
                });
            } catch (fedaError) {
                console.error('[FedaPay] Error on create:', fedaError);
                return res.status(500).json({ error: 'Erreur lors de l\'initialisation du paiement.', details: fedaError.message });
            }
        }

        res.status(201).json({ 
            message: 'Commande créée', 
            order: mainOrder.toJSON(), 
            delivery_code: mainOrder.delivery_code 
        });
    } catch (error) {
        console.error("CREATE ORDER ERROR:", error);
        res.status(500).json({ error: 'Erreur lors de la création de la commande', details: error.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, proof_url } = req.body;

        const order = await Order.findByPk(id);
        if (!order) return res.status(404).json({ error: 'Commande non trouvée' });

        const userId = req.auth?.userId;
        const role = req.auth?.role;

        // Authorization checks
        if (role !== 'admin') {
            // Get profile IDs for the current user
            const [supplier, rider] = await Promise.all([
                Supplier.findOne({ where: { user_id: userId } }),
                DeliveryPerson.findOne({ where: { user_id: userId } })
            ]);

            const isOrderSupplier = supplier && order.supplier_id === supplier.id;
            const isOrderRider = rider && order.delivery_person_id === rider.id;

            if (!isOrderSupplier && !isOrderRider) {
                return res.status(403).json({ error: 'Accès non autorisé à cette commande.' });
            }

            // Status-specific restrictions
            if (status === 'livrée') {
                if (!order.delivery_person_id) {
                    return res.status(400).json({ error: 'Un livreur doit être assigné pour confirmer la livraison.' });
                }
                if (!isOrderRider) {
                    return res.status(403).json({ error: 'Seul le livreur désigné peut confirmer la livraison.' });
                }
            }
            
            if (isOrderSupplier && !isOrderRider && !['confirmée', 'expédiée', 'annulée'].includes(status)) {
                 return res.status(403).json({ error: 'Action non autorisée pour un fournisseur.' });
            }
        }

        const oldStatus = order.status;

        const STATUS_MAP = {
            'livree': 'livrée',
            'expediee': 'expédiée',
            'confirmee': 'confirmée',
            'assignee': 'assignée'
        };
        const mappedStatus = STATUS_MAP[status] || status;
        
        const updatePayload = {};
        const now = new Date();

        if (status) {
            updatePayload.status = mappedStatus;
            
            // Manage history
            let history = order.status_history || [];
            if (typeof history === 'string') history = JSON.parse(history);
            history.push({ status: mappedStatus, date: now });
            updatePayload.status_history = history;

            // Manage specific timestamps
            if (mappedStatus === 'confirmée') updatePayload.confirmed_at = now;
            if (mappedStatus === 'expédiée') updatePayload.shipped_at = now;
            if ((mappedStatus === 'livrée') && oldStatus !== 'livrée' && oldStatus !== 'livree') {
                updatePayload.delivered_at = now;
            }
        }

        if (req.body.proof_url) updatePayload.proof_url = req.body.proof_url;
        if (req.body.colis_count) updatePayload.colis_count = req.body.colis_count;
        if (req.body.payment_status) updatePayload.payment_status = req.body.payment_status;

        await order.update(updatePayload);

        // 1. Stock deduction on confirmation
        if (mappedStatus === 'confirmée' && oldStatus === 'en_attente') {
            try {
                const items = await OrderItem.findAll({ where: { order_id: order.id } });
                for (const item of items) {
                    const variantPrice = await ProductVariantPrice.findOne({
                        where: { variant_id: item.variant_id }
                    });
                    if (variantPrice) {
                        await variantPrice.decrement('stock', { by: item.quantity });
                    }
                }
            } catch (stockErr) {
                console.error("STOCK DEDUCTION ERROR:", stockErr);
            }
        }

        // 2. Financial logging on delivery
        const isDelivered = (mappedStatus === 'livrée') && (oldStatus !== 'livrée');
        if (isDelivered) {
            await processOrderFinancials(order);
        }

        // 3. Handle Cancellations & Returns (Escrow protection)
        if ((mappedStatus === 'annulée' || mappedStatus === 'retournée') && (oldStatus !== 'annulée' && oldStatus !== 'retournée')) {
            // Re-increment stock if it was previously confirmed/deducted
            if (['confirmée', 'expédiée', 'livrée'].includes(oldStatus)) {
                try {
                    const items = await OrderItem.findAll({ where: { order_id: order.id } });
                    for (const item of items) {
                        if (item.variant_id) {
                            await ProductVariant.increment('stock', { by: item.quantity, where: { id: item.variant_id } });
                        } else {
                            await Product.increment('stock', { by: item.quantity, where: { id: item.product_id } });
                        }
                    }
                } catch (stockErr) {
                    console.error("STOCK RESTORE ERROR:", stockErr);
                }
            }

            // Void any financial transactions (Supplier & Livreur earnings)
            // This directly reduces their balance, simulating an Escrow refund
            try {
                await FinancialTransaction.update(
                    { status: 'cancelled' },
                    { where: { order_id: order.id, type: 'earning' } }
                );
            } catch (voidErr) {
                console.error("FINANCIAL VOID ERROR:", voidErr);
            }
        }

        // 4. Email notification
        try {
            const userProfile = await Profile.findByPk(order.user_id);
            if (userProfile?.email) {
                await sendOrderUpdateToCustomer(order, userProfile.email, status);
            }
        } catch (_) {}

        res.json({ message: 'Statut mis à jour', order });
    } catch (error) {
        console.error("UPDATE ORDER ERROR:", error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour', details: error.message });
    }
};

export const getOrderDeliveryCode = async (req, res) => {
    try {
        const userId = req.auth?.userId;
        const { id } = req.params;

        const order = await Order.findOne({ where: { id, user_id: userId } });
        if (!order) return res.status(404).json({ error: 'Commande non trouvée' });

        res.json({ delivery_code: order.delivery_code });
    } catch (error) {
        console.error("GET ORDER DELIVERY CODE ERROR:", error);
        res.status(500).json({ error: 'Erreur serveur', details: error.message });
    }
};

export const getSuggestedLivreurs = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findByPk(id, { include: [{ model: Supplier, as: 'supplier' }] });
        if (!order) return res.status(404).json({ error: 'Commande non trouvée' });

        const supplierCommune = (order.supplier?.commune_label || order.supplier?.commune || '').toLowerCase();

        // Get all verified/active livreurs
        const livreurs = await DeliveryPerson.findAll({
            include: [{ model: Profile, as: 'profile', attributes: ['fullname', 'phone'] }]
        });

        const results = livreurs.map(lp => {
            const lpCommune = (lp.service_zones || []).map(z => z.toLowerCase());
            let matchScore = 0;
            
            // Check if supplier commune is in rider's service zones
            if (supplierCommune && lpCommune.includes(supplierCommune)) {
                matchScore = 100;
            }

            return {
                id: lp.id,
                name: lp.profile?.fullname || 'Livreur',
                phone: lp.profile?.phone || lp.phone,
                vehicle: `${lp.vehicle_type} (${lp.vehicle_model})`,
                zones: lp.service_zones,
                matchScore
            };
        });

        results.sort((a, b) => b.matchScore - a.matchScore);
        res.json(results);
    } catch (error) {
        console.error("GET SUGGESTED LIVREURS ERROR:", error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};