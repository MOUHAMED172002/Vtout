import { Op } from 'sequelize';
import { Order, OrderItem, Product, Address, Cart, ProductVariant, ProductImage, ProductVariantPrice, Profile, DeliveryPerson, Supplier, SupplierProduct, FinancialTransaction, Config, SupportMessage, Boutique, Coupon } from '../models/index.js';
import sequelize from '../config/database.js';
import { getRoadDistance, calculateDeliveryFee } from '../services/distanceService.js';
import { sendInvoiceEmail, sendOrderNotificationToAdmin, sendOrderUpdateToCustomer } from '../services/mailService.js';
import { processOrderFinancials } from '../services/financialService.js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { createFedapayTransaction } from '../services/fedapayService.js';
import { sendNewOrderWhatsApp, notifySupplierOfNewOrder, notifyDelivererOfAssignment, notifyCustomerOfStatusUpdate, notifyAdmin } from '../services/whatsappService.js';


export const getMyOrders = async (req, res) => {
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

export const getMySupplierOrders = async (req, res) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: 'Non autorisé' });

        const supplier = await Supplier.findOne({ where: { user_id: userId } });
        if (!supplier) return res.json([]); // Return empty array instead of 404

        const orders = await Order.findAll({
            where: { supplier_id: supplier.id },
            order: [['created_at', 'DESC']],
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
                { 
                    model: Supplier, 
                    as: 'supplier', 
                    attributes: req.auth?.role === 'admin' ? ['name', 'address_line', 'phone'] : ['name'] 
                },
                { model: DeliveryPerson, as: 'deliveryPerson', include: [{ model: Profile, as: 'profile', attributes: ['fullname', 'phone'] }] }
            ]
        });

        if (!order) return res.status(404).json({ error: 'Commande non trouvée' });

        // Security check: Only owner, assigned supplier/rider, or admin can see the order
        const userId = req.auth?.userId;
        const role = req.auth?.role;
        const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
        const isAdmin = role === 'admin' || adminEmails.includes(req.auth?.email?.toLowerCase());

        if (isAdmin) return res.json(order.toJSON());

        // 1. Check if user is the owner
        if (order.user_id && order.user_id === userId) return res.json(order.toJSON());

        // 2. Check if user is the assigned supplier
        if (userId) {
            const supplier = await Supplier.findOne({ where: { user_id: userId } });
            if (supplier && order.supplier_id === supplier.id) return res.json(order.toJSON());
        }

        // 3. Check if user is the assigned rider
        if (userId) {
            const rider = await DeliveryPerson.findOne({ where: { user_id: userId } });
            if (rider && order.delivery_person_id === rider.id) return res.json(order.toJSON());
        }

        return res.status(403).json({ error: 'Accès non autorisé à cette commande' });


    } catch (error) {
        console.error("GET ORDER ERROR:", error);
        res.status(500).json({ error: 'Erreur Serveur', details: error.message });
    }
};

export const createOrder = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const userId = req.auth?.userId || null;
        const { items, address_id, payment_method, notes, delivery_fee, guest_name, guest_email, guest_phone, coupon_code } = req.body;
        
        if (!items || items.length === 0) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Le panier est vide' });
        }

        // --- WALLET PAYMENT CHECK ---
        if (payment_method === 'wallet') {
            if (!userId) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Connectez-vous pour utiliser votre portefeuille' });
            }

            // LOCK the profile to prevent concurrent wallet payments for the same user
            await Profile.findByPk(userId, { transaction, lock: true });

            // Calculate current balance ( earnings - payouts - previous wallet purchases )
            const summary = await FinancialTransaction.findAll({

                where: { user_id: userId, status: 'completed' },
                attributes: ['type', [sequelize.fn('SUM', sequelize.col('amount')), 'total']],
                group: ['type'],
                transaction
            });

            let balance = 0;
            summary.forEach(s => {
                const val = parseFloat(s.get('total') || 0);
                if (s.type === 'earning') balance += val;
                if (s.type === 'payout') balance -= val;
                if (s.type === 'adjustment') balance += val;
            });

            // Calculate current total for validation (re-calculating subtotal + delivery - discount)
            // Note: Full subtotal calculation logic is below, but we need a rough check here or move this after subtotal calc.
            // Let's move the wallet check after subtotal and discount calculations for accuracy.
        }

        let subtotal = 0;

        const enrichedItems = [];

        // 1. Initial Validation & Stock Check
        for (const item of items) {
            const product = await Product.findByPk(item.product_id, { transaction });
            if (!product) {
                await transaction.rollback();
                return res.status(404).json({ error: `Produit ${item.product_id} non trouvé` });
            }

            let unitPrice = parseFloat(product.price) > 0 ? parseFloat(product.price) : parseFloat(product.supplier_price || 0);
            let variantData = null;

            if (item.variant_price_id) {
                // LOCK the row to prevent concurrent orders from overselling the same variant
                const variantPrice = await ProductVariantPrice.findByPk(item.variant_price_id, {
                    include: [{ model: ProductVariant, as: 'variant' }],
                    transaction,
                    lock: true
                });
                if (variantPrice) {
                    if (variantPrice.variant.product_id !== product.id) {
                        await transaction.rollback();
                        return res.status(400).json({ error: `La variante ne correspond pas au produit ${product.name}` });
                    }
                    if (variantPrice.stock < item.quantity) {
                        await transaction.rollback();
                        return res.status(400).json({ error: `Stock insuffisant pour ${product.name} (Disponible: ${variantPrice.stock})` });
                    }
                    unitPrice = parseFloat(variantPrice.price || unitPrice);
                    variantData = variantPrice;
                }
            } else {
                // LOCK the product row for simple-stock products
                const lockedProduct = await Product.findByPk(product.id, { transaction, lock: true });
                if (lockedProduct && lockedProduct.stock !== undefined && lockedProduct.stock < item.quantity) {
                    await transaction.rollback();
                    return res.status(400).json({ error: `Stock insuffisant pour ${product.name}` });
                }
            }

            subtotal += unitPrice * item.quantity;
            enrichedItems.push({ product, item, unitPrice, variantData });
        }

        // 2. Group items by supplier
        const itemsBySupplier = {};
        for (const { product, item, unitPrice, variantData } of enrichedItems) {
            let sId = product.supplier_id;
            if (!sId) {
                const sp = await SupplierProduct.findOne({ where: { product_id: product.id }, transaction });
                sId = sp?.supplier_id || 'no_supplier';
            }
            if (!itemsBySupplier[sId]) itemsBySupplier[sId] = [];
            itemsBySupplier[sId].push({ product, item, unitPrice, variantData });
        }

        const supplierIds = Object.keys(itemsBySupplier);
        const createdOrders = [];
        
        // 3. Coupon Logic
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
                },
                transaction
            });
            
            if (validatedCoupon) {
                if (!validatedCoupon.usage_limit || validatedCoupon.used_count < validatedCoupon.usage_limit) {
                    if (subtotal >= parseFloat(validatedCoupon.min_order_amount)) {
                        totalDiscount = validatedCoupon.discount_type === 'percentage' 
                            ? (subtotal * parseFloat(validatedCoupon.discount_value)) / 100 
                            : parseFloat(validatedCoupon.discount_value);
                        totalDiscount = Math.min(totalDiscount, subtotal);
                    }
                }
            }
        }

        // 4. Create individual orders per supplier
        for (const sId of supplierIds) {
            const supplierItems = itemsBySupplier[sId];
            const actualSupplierId = sId === 'no_supplier' ? null : sId;
            let sSubtotal = supplierItems.reduce((sum, si) => sum + (si.unitPrice * si.item.quantity), 0);
            
            let sDeliveryFee = 1000; 
            const orderShareOfSubtotal = subtotal > 0 ? (sSubtotal / subtotal) : 1;
            const sDiscount = totalDiscount * orderShareOfSubtotal;
            const sTotal = (sSubtotal - sDiscount) + sDeliveryFee;
            
            const deliveryCode = Math.floor(1000 + Math.random() * 9000).toString();
            const orderId = crypto.randomUUID();

            const order = await Order.create({
                id: orderId,
                user_id: userId,
                guest_name,
                guest_email,
                guest_phone,
                address_id,
                payment_method: payment_method || 'delivery',
                payment_status: 'en_attente',
                status: 'en_attente',
                total_amount: sTotal,
                delivery_fee: sDeliveryFee,
                discount_amount: sDiscount,
                coupon_code: sDiscount > 0 ? coupon_code : null,
                notes,
                delivery_code: deliveryCode,
                supplier_id: actualSupplierId,
                items_count: supplierItems.length
            }, { transaction });

            for (const { product, item, unitPrice, variantData } of supplierItems) {
                await OrderItem.create({
                    order_id: order.id,
                    product_id: product.id,
                    variant_id: variantData?.variant_id || null,
                    quantity: item.quantity,
                    price: unitPrice
                }, { transaction });

                if (variantData) {
                    await variantData.decrement('stock', { by: item.quantity, transaction });
                } else if (product.stock !== undefined) {
                    await product.decrement('stock', { by: item.quantity, transaction });
                }
            }
            createdOrders.push(order);

            // WhatsApp Notif to Supplier
            if (actualSupplierId) {
                Supplier.findByPk(actualSupplierId, { include: [{ model: Profile, as: 'profile' }] }).then(supplier => {
                    const phone = supplier?.phone || supplier?.profile?.phone;
                    if (phone) notifySupplierOfNewOrder(phone, order.id, order.total_amount);
                });
            }
        }

        if (userId) {
            await Cart.destroy({ where: { user_id: userId }, transaction });
        }
        if (validatedCoupon && totalDiscount > 0) {
            await validatedCoupon.increment('used_count', { by: 1, transaction });
        }

        // --- FINAL WALLET DEBIT ---
        if (payment_method === 'wallet') {
            const grandTotal = createdOrders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
            
            // Re-fetch balance inside transaction to be sure
            const summary = await FinancialTransaction.findAll({
                where: { user_id: userId, status: 'completed' },
                attributes: ['type', [sequelize.fn('SUM', sequelize.col('amount')), 'total']],
                group: ['type'],
                transaction
            });

            let currentBalance = 0;
            summary.forEach(s => {
                const val = parseFloat(s.get('total') || 0);
                if (s.type === 'earning') currentBalance += val;
                if (s.type === 'payout') currentBalance -= val;
                if (s.type === 'adjustment') currentBalance += val;
            });

            if (currentBalance < grandTotal) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Solde insuffisant pour finaliser cet achat.' });
            }

            // Create Payout transaction for the purchase
            await FinancialTransaction.create({
                id: crypto.randomUUID(),
                user_id: userId,
                type: 'payout',
                amount: grandTotal,
                description: `Achat Vtout - Commande #${createdOrders[0].id.slice(0, 8)}`,
                status: 'completed',
                order_id: createdOrders[0].id
            }, { transaction });

            // Mark orders as paid
            for (const order of createdOrders) {
                await order.update({ payment_status: 'payé' }, { transaction });
            }
        }

        await transaction.commit();


        const mainOrder = createdOrders[0];
        let totalCartAmount = createdOrders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);

        sendOrderNotificationToAdmin(mainOrder, enrichedItems.map(e => e.product)).catch(() => {});
        sendInvoiceEmail(mainOrder, enrichedItems.map(e => ({ ...e.item, product: e.product, unit_price: e.unitPrice }))).catch(() => {});
        
        // WhatsApp Notif to Customer
        const customerPhone = guest_phone || (userId ? (await Profile.findByPk(userId))?.phone : null);
        if (customerPhone) sendNewOrderWhatsApp(customerPhone, mainOrder.id, totalCartAmount).catch(() => {});
        
        // WhatsApp Notif to Admin
        notifyAdmin(`Nouvelle commande reçue ! ID: #${mainOrder.id.slice(0, 8)} - Client: ${guest_name || 'Inconnu'} - Total: ${totalCartAmount} F`).catch(() => {});

        if (['fedapay', 'mobile_money', 'card'].includes(payment_method)) {
            try {
                const customerProfile = userId ? await Profile.findByPk(userId) : null;
                // Le redirectUrl doit pointer vers notre endpoint backend qui traitera le retour
                const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
                const callbackUrl = `${backendUrl}/api/payments/fedapay-callback?order_id=${mainOrder.id}`;
                
                const fedapayOrderObj = { ...mainOrder.toJSON(), total_amount: totalCartAmount };
                fedapayOrderObj.id = createdOrders.map(o => o.id).join(','); 

                const fedaTx = await createFedapayTransaction(fedapayOrderObj, customerProfile, callbackUrl);
                
                return res.status(201).json({
                    message: 'Commande créée (Paiement Requis)',
                    order: mainOrder.toJSON(),
                    payment_url: fedaTx.checkoutUrl,
                    transaction_id: fedaTx.transactionId
                });
            } catch (fedaError) {
                return res.status(201).json({ 
                    message: 'Commande créée, mais erreur de paiement. Veuillez payer via votre historique.', 
                    order: mainOrder.toJSON(),
                    payment_error: true 
                });
            }
        }

        res.status(201).json({ 
            message: 'Commande créée avec succès', 
            order: mainOrder.toJSON(), 
            delivery_code: mainOrder.delivery_code 
        });

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error("CREATE ORDER ERROR:", error);
        notifyAdmin(`❌ ERREUR CRITIQUE (Create Order): ${error.message}`).catch(() => {});
        res.status(500).json({ error: 'Erreur lors de la création de la commande', details: error.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

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
        
        // SECURITY: Only Admin can manually update payment_status
        if (req.body.payment_status && role === 'admin') {
            updatePayload.payment_status = req.body.payment_status;
        }

        await order.update(updatePayload);

        // WhatsApp Notif to Customer
        try {
            const userProfile = await Profile.findByPk(order.user_id);
            const customerPhone = order.guest_phone || userProfile?.phone;
            if (customerPhone && status) {
                notifyCustomerOfStatusUpdate(customerPhone, order.id, mappedStatus).catch(() => {});
            }
        } catch (_) {}

        // WhatsApp Notif to Deliverer (if assigned)
        if (req.body.delivery_person_id) {
            DeliveryPerson.findByPk(req.body.delivery_person_id, { include: [{ model: Profile, as: 'profile' }] }).then(deliverer => {
                const phone = deliverer?.phone || deliverer?.profile?.phone;
                if (phone) notifyDelivererOfAssignment(phone, order.id);
            });
        }

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
            await processOrderFinancials(order.id);
        }


        // 3. Handle Cancellations & Returns (Escrow protection & Customer Refund)
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
            try {
                await FinancialTransaction.update(
                    { status: 'cancelled' },
                    { where: { order_id: order.id, type: 'earning' } }
                );
            } catch (voidErr) {
                console.error("FINANCIAL VOID ERROR:", voidErr);
            }

            // REFUND CUSTOMER if paid via wallet
            if (order.payment_method === 'wallet' && order.user_id) {
                try {
                    const debitTx = await FinancialTransaction.findOne({
                        where: { order_id: order.id, user_id: order.user_id, type: 'payout' }
                    });

                    if (debitTx) {
                        // Create a refund transaction (re-crediting the wallet)
                        await FinancialTransaction.create({
                            id: crypto.randomUUID(),
                            user_id: order.user_id,
                            order_id: order.id,
                            type: 'earning', 
                            amount: debitTx.amount,
                            description: `Remboursement commande #${order.id.slice(0, 8)}`,
                            status: 'completed'
                        });

                        await Notification.create({
                            id: crypto.randomUUID(),
                            user_id: order.user_id,
                            title: '💰 Remboursement effectué',
                            message: `Votre portefeuille a été recrédité de ${debitTx.amount} F CFA suite à l'annulation de votre commande.`,
                            type: 'wallet'
                        });
                    }
                } catch (refundErr) {
                    console.error("CUSTOMER REFUND ERROR:", refundErr);
                }
            }
        }


        // 4. Email notification
        try {
            const userProfile = await Profile.findByPk(order.user_id);
            if (userProfile?.email) {
                await sendOrderUpdateToCustomer(order, userProfile.email, status);
            }
        } catch (_) {}

        // 5. Real-time notifications via Socket.io
        if (req.io) {
            // Notify Customer
            if (order.user_id) {
                req.io.to(order.user_id).emit('order_status_updated', {
                    orderId: order.id,
                    status: mappedStatus,
                    message: `Votre commande #${order.id.slice(0, 8)} est maintenant ${mappedStatus}.`
                });
            }
            // Notify Admins
            req.io.to('admins').emit('admin_notification', {
                type: 'ORDER_UPDATE',
                message: `Commande #${order.id.slice(0, 8)} mise à jour vers ${mappedStatus}.`,
                orderId: order.id
            });
        }

        res.json({ message: 'Statut mis à jour', order });
    } catch (error) {
        console.error("UPDATE ORDER ERROR:", error);
        notifyAdmin(`❌ ERREUR (Update Order ID: ${req.params.id}): ${error.message}`).catch(() => {});
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

export const getSuggestedSuppliers = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findByPk(id, {
            include: [{ model: OrderItem, as: 'items' }]
        });
        if (!order) return res.status(404).json({ error: 'Commande non trouvée' });

        const productIds = order.items.map(item => item.product_id);

        // Find all suppliers that offer these products
        // This is a simplified logic: find suppliers who have these products in SupplierProduct
        const supplierProducts = await SupplierProduct.findAll({
            where: { product_id: { [Op.in]: productIds } },
            include: [{ 
                model: Supplier, 
                as: 'supplier',
                include: [{ model: Profile, as: 'profile', attributes: ['fullname', 'phone'] }]
            }]
        });

        // Unique suppliers
        const suppliersMap = new Map();
        supplierProducts.forEach(sp => {
            if (sp.supplier && !suppliersMap.has(sp.supplier.id)) {
                suppliersMap.set(sp.supplier.id, {
                    id: sp.supplier.id,
                    name: sp.supplier.name,
                    phone: sp.supplier.profile?.phone || sp.supplier.phone,
                    address: sp.supplier.address_line,
                    commune: sp.supplier.commune_label || sp.supplier.commune
                });
            }
        });

        res.json(Array.from(suppliersMap.values()));
    } catch (error) {
        console.error("GET SUGGESTED SUPPLIERS ERROR:", error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const assignSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const { supplier_id } = req.body;

        const order = await Order.findByPk(id);
        if (!order) return res.status(404).json({ error: 'Commande non trouvée' });

        await order.update({ supplier_id });

        res.json({ message: 'Fournisseur assigné avec succès', order });
    } catch (error) {
        console.error("ASSIGN SUPPLIER ERROR:", error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};