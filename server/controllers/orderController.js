import { Op } from 'sequelize';
import { Order, OrderItem, Product, Address, Cart, ProductVariant, ProductImage, ProductVariantPrice, Profile, DeliveryPerson, Supplier, SupplierProduct, FinancialTransaction, Config, SupportMessage, Boutique, Coupon, CouponUsage, Category, Notification, Dispute, Kit, KitComponent, PendingCheckout } from '../models/index.js';
import sequelize from '../config/database.js';
import { getRoadDistance, calculateDeliveryFee } from '../services/distanceService.js';
import { sendInvoiceEmail, sendOrderNotificationToAdmin, sendOrderUpdateToCustomer } from '../services/mailService.js';
import { sendMetaCapiEvent } from '../services/metaCapiService.js';
import { processOrderFinancials } from '../services/financialService.js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { createFedapayTransaction, verifyFedapayTransaction } from '../services/fedapayService.js';
import { sendNewOrderWhatsApp, notifySupplierOfNewOrder, notifyDelivererOfAssignment, notifyCustomerOfStatusUpdate, notifyAdmin, notifySupplierOfLowStock, notifySupplierOfOrderStatusUpdate, notifyDelivererOfOrderStatusUpdate, sendWhatsAppMessage } from '../services/whatsappService.js';
import { getDeliveryFeeTiers, computeDeliveryFee, decomposePublicPrice, getDeliveryMultiplierTiers, computeDeliveryMultiplier } from '../services/deliveryFeeService.js';
import { rewardReferrerIfPending } from './referralController.js';


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
            where: { supplier_id: supplier.id, status: { [Op.ne]: 'en_attente' } },
            order: [['created_at', 'DESC']],
            include: [
                { model: Boutique, as: 'boutique', attributes: ['name', 'commune_label', 'whatsapp', 'phone'] },
                { 
                    model: OrderItem, 
                    as: 'items',
                    include: [
                        { model: Product, as: 'product', attributes: ['name', 'price', 'supplier_price'], include: [{ model: Category, as: 'category', attributes: ['commission_rate'] }] },
                        { model: Boutique, as: 'boutique', attributes: ['name', 'commune_label'] }
                    ] 
                }
            ]
        });

        const globalRateConfig = await Config.findOne({ where: { key: 'commission_rate' } });
        const globalCommissionRate = globalRateConfig?.value ? parseFloat(globalRateConfig.value) / 100 : 0.10;
        const deliveryTiers = await getDeliveryFeeTiers();
        const multiplierTiers = await getDeliveryMultiplierTiers();

        const enrichedOrders = orders.map(order => {
            const orderJson = order.toJSON();
            let supplierTotal = 0;
            let adminTotal = 0;
            let totalEmbeddedFees = 0;
            let totalQuantity = 0;

            if (orderJson.items) {
                for (const item of orderJson.items) {
                    const itemClientPrice = parseFloat(item.price) || 0;
                    const itemSupplierPrice = parseFloat(item.product?.supplier_price || 0);
                    let itemRate = globalCommissionRate;
                    if (item.product?.category?.commission_rate) {
                        itemRate = parseFloat(item.product.category.commission_rate) / 100;
                    }
                    const embeddedFee = itemSupplierPrice > 0
                        ? computeDeliveryFee(itemSupplierPrice, deliveryTiers)
                        : decomposePublicPrice(itemClientPrice, itemRate, deliveryTiers).deliveryFee;
                    const supplierNet = Math.max(0, itemClientPrice - embeddedFee);
                    const commissionAmount = Math.round(supplierNet * itemRate);
                    totalEmbeddedFees += embeddedFee * item.quantity;
                    totalQuantity += item.quantity;
                    adminTotal += commissionAmount * item.quantity;
                    supplierTotal += Math.round((supplierNet - commissionAmount) * item.quantity);
                }
            }

            const multiplier = computeDeliveryMultiplier(totalQuantity, multiplierTiers);
            const delivererFlatFee = totalQuantity > 0
                ? Math.round((totalEmbeddedFees / totalQuantity) * multiplier)
                : 0;
            return {
                ...orderJson,
                supplier_earnings: supplierTotal,
                admin_commission: adminTotal,
                deliverer_fee: delivererFlatFee + parseFloat(orderJson.delivery_fee || 0)
            };
        });

        res.json(enrichedOrders);
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
                        { 
                            model: Product, 
                            as: 'product', 
                            include: [
                                { model: ProductImage, as: 'images', where: { is_main: true }, required: false },
                                { model: Category, as: 'category' }
                            ] 
                        },
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
 
        // If it's part of a split order, fetch siblings
        let siblings = [];
        if (order.parent_id) {
            siblings = await Order.findAll({
                where: { 
                    parent_id: order.parent_id,
                    id: { [Op.ne]: order.id }
                },
                include: [
                    {
                        model: OrderItem,
                        as: 'items',
                        include: [
                            { model: Product, as: 'product', include: [{ model: ProductImage, as: 'images', where: { is_main: true }, required: false }] },
                            { model: ProductVariant, as: 'variant' }
                        ]
                    },
                    { model: Boutique, as: 'boutique' }
                ]
            });
        }

        // Security check: Only owner, assigned supplier/rider, or admin can see the order
        const userId = req.auth?.userId;
        const role = req.auth?.role;
        const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
        const isAdmin = role === 'admin' || adminEmails.includes(req.auth?.email?.toLowerCase());

        // Calculate dynamic delivery, platform and supplier fees/earnings
        const globalRateConfig = await Config.findOne({ where: { key: 'commission_rate' } });
        const globalCommissionRate = globalRateConfig?.value ? parseFloat(globalRateConfig.value) / 100 : 0.10;
        const deliveryTiers = await getDeliveryFeeTiers();
        const multiplierTiers = await getDeliveryMultiplierTiers();

        const orderJson = order.toJSON();
        let totalEmbeddedFees = 0;
        let totalQuantity = 0;
        let adminTotal = 0;
        let supplierTotal = 0;
        let subtotal = 0;

        if (orderJson.items) {
            for (const item of orderJson.items) {
                const itemClientPrice = parseFloat(item.price) || 0;
                const itemSupplierPrice = parseFloat(item.product?.supplier_price || 0);
                let itemRate = globalCommissionRate;
                if (item.product?.category?.commission_rate) {
                    itemRate = parseFloat(item.product.category.commission_rate) / 100;
                }
                const embeddedFee = itemSupplierPrice > 0
                    ? computeDeliveryFee(itemSupplierPrice, deliveryTiers)
                    : decomposePublicPrice(itemClientPrice, itemRate, deliveryTiers).deliveryFee;
                const supplierNet = Math.max(0, itemClientPrice - embeddedFee);
                const commissionAmount = Math.round(supplierNet * itemRate);
                totalEmbeddedFees += embeddedFee * item.quantity;
                totalQuantity += item.quantity;
                adminTotal += commissionAmount * item.quantity;
                supplierTotal += Math.round((supplierNet - commissionAmount) * item.quantity);
                subtotal += itemClientPrice * item.quantity;
            }
        }

        const multiplier = computeDeliveryMultiplier(totalQuantity, multiplierTiers);
        const geographicalFee = parseFloat(orderJson.delivery_fee || 0);
        const delivererFlatFee = totalQuantity > 0
            ? Math.round((totalEmbeddedFees / totalQuantity) * multiplier)
            : 0;
        orderJson.deliverer_fee = delivererFlatFee + geographicalFee;
        orderJson.admin_commission = adminTotal;
        orderJson.supplier_earnings = supplierTotal;

        if (isAdmin) return res.json({ ...orderJson, siblings });

        // 1. Check if user is the owner
        if (order.user_id && order.user_id === userId) return res.json({ ...orderJson, siblings });

        // 2. Guest Order access (if it's a guest order and they have the ID)
        if (!order.user_id) return res.json({ ...orderJson, siblings });

        // 3. Check if user is the assigned supplier
        if (userId) {
            const supplier = await Supplier.findOne({ where: { user_id: userId } });
            if (supplier && order.supplier_id === supplier.id) {
                const safeOrder = { ...orderJson };
                delete safeOrder.guest_name;
                delete safeOrder.guest_email;
                delete safeOrder.guest_phone;
                delete safeOrder.user;
                delete safeOrder.address;
                delete safeOrder.address_id;
                delete safeOrder.user_id;
                return res.json(safeOrder);
            }
        }

        // 4. Check if user is the assigned rider
        if (userId) {
            const rider = await DeliveryPerson.findOne({ where: { user_id: userId } });
            if (rider && order.delivery_person_id === rider.id) return res.json(orderJson);
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
        const { items, address_id, payment_method, notes, delivery_fee, guest_name, guest_email, guest_phone, whatsapp_notif_phone, coupon_code } = req.body;
        
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
                where: { 
                    user_id: userId, 
                    status: 'completed',
                    [Op.or]: [
                        { source: { [Op.ne]: 'admin_commission' } },
                        { source: null }
                    ]
                },
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
            const product = await Product.findByPk(item.product_id, { 
                include: [{ model: Boutique, as: 'boutique' }],
                transaction 
            });
            if (!product) {
                await transaction.rollback();
                return res.status(404).json({ error: `Produit ${item.product_id} non trouvé` });
            }

            // Always derive price from DB — never trust client-sent price for computation.
            let basePrice = parseFloat(product.price) > 0 ? parseFloat(product.price) : parseFloat(product.supplier_price || 0);

            // If flash sale has expired, revert to old_price (the original price before the sale)
            if (product.is_flash_sale && product.flash_sale_end && new Date(product.flash_sale_end) < new Date()) {
                const originalPrice = parseFloat(product.old_price);
                if (originalPrice > 0) basePrice = originalPrice;
            }
            let variantData = null;

            // Support both variant_price_id (direct) and variant_id (lookup)
            let variantPriceId = item.variant_price_id || null;
            if (!variantPriceId && item.variant_id) {
                // Look up the first price row for this variant
                const vp = await ProductVariantPrice.findOne({
                    where: { variant_id: item.variant_id },
                    include: [{ model: ProductVariant, as: 'variant' }],
                    transaction
                });
                if (vp) variantPriceId = vp.id;
            }

            if (variantPriceId) {
                // LOCK the row to prevent concurrent orders from overselling the same variant
                const variantPrice = await ProductVariantPrice.findByPk(variantPriceId, {
                    include: [{ model: ProductVariant, as: 'variant' }],
                    transaction,
                    lock: true
                });
                if (variantPrice) {
                    if (variantPrice.variant.product_id !== product.id) {
                        await transaction.rollback();
                        return res.status(400).json({ error: `La variante ne correspond pas au produit ${product.name}` });
                    }
                    // Disponible à l'achat = stock physique - déjà réservé par des
                    // commandes en cours (le stock réel n'est décrémenté qu'à la livraison).
                    const availableVariantStock = variantPrice.stock - (variantPrice.reserved_stock || 0);
                    if (availableVariantStock < item.quantity) {
                        await transaction.rollback();
                        return res.status(400).json({ error: `Stock insuffisant pour ${product.name} (Disponible: ${availableVariantStock})` });
                    }
                    basePrice = parseFloat(variantPrice.price || basePrice);
                    variantData = variantPrice;
                    // Inject for downstream usage
                    item.variant_price_id = variantPriceId;
                    item.variant_id = variantPrice.variant_id;
                }
            } else {
                // LOCK the product row for simple-stock products
                const lockedProduct = await Product.findByPk(product.id, { transaction, lock: true });
                if (lockedProduct && lockedProduct.stock !== undefined && lockedProduct.stock !== null) {
                    const availableProductStock = lockedProduct.stock - (lockedProduct.reserved_stock || 0);
                    if (availableProductStock < item.quantity) {
                        await transaction.rollback();
                        return res.status(400).json({ error: `Stock insuffisant pour ${product.name} (Disponible: ${availableProductStock})` });
                    }
                }
            }

            // Always apply volume pricing server-side so promo prices are always authoritative.
            let unitPrice = basePrice;
            if (product.volume_pricing) {
                try {
                    const tiers = typeof product.volume_pricing === 'string'
                        ? JSON.parse(product.volume_pricing)
                        : product.volume_pricing;
                    if (Array.isArray(tiers) && tiers.length > 0) {
                        const normalizedTiers = tiers
                            .map(t => ({ ...t, min_qty: Math.max(1, t.min_qty ?? t.min ?? t.qty ?? 1) }))
                            .sort((a, b) => b.min_qty - a.min_qty);
                        const metTier = normalizedTiers.find(t => item.quantity >= t.min_qty);
                        if (metTier) {
                            const discountPercent = parseFloat(metTier.discount || 0);
                            if (discountPercent > 0) {
                                const sp = parseFloat(product.supplier_price || 0);
                                unitPrice = sp > 0 && sp < basePrice
                                    ? basePrice - sp * (discountPercent / 100)
                                    : basePrice * (1 - discountPercent / 100);
                            }
                        }
                    }
                } catch (e) {
                    console.error("Error parsing volume pricing during order creation:", e);
                }
            }

            // Kit pricing — new Kit entity takes priority; falls back to legacy product-based kit.
            if (item.kit_id) {
                try {
                    // ── New Kit model (kits table) ──
                    const kit = await Kit.findByPk(item.kit_id, {
                        include: [{ model: Product, as: 'components', attributes: ['id', 'price', 'old_price', 'is_flash_sale', 'flash_sale_end', 'boutique_id'] }],
                        transaction
                    });

                    if (kit && kit.is_active) {
                        const bundlePrice = parseFloat(kit.bundle_price);
                        const kitComponents = kit.components || [];
                        const orderProductIds = items.map(i => String(i.product_id));
                        const allPresent = kitComponents.length > 0 &&
                            kitComponents.every(c => orderProductIds.includes(String(c.id)));

                        if (allPresent) {
                            const totalOriginal = kitComponents.reduce((sum, c) => {
                                let cPrice = parseFloat(c.price || 0);
                                if (c.is_flash_sale && c.flash_sale_end && new Date(c.flash_sale_end) < new Date()) {
                                    const cOld = parseFloat(c.old_price || 0);
                                    if (cOld > 0) cPrice = cOld;
                                }
                                return sum + cPrice;
                            }, 0);
                            if (totalOriginal > 0) {
                                unitPrice = Math.round(basePrice * (bundlePrice / totalOriginal));
                            }
                        }
                    } else {
                        // ── Legacy: kit_id points to a Product with is_kit=true ──
                        const kitProduct = await Product.findByPk(item.kit_id, {
                            attributes: ['id', 'price', 'old_price', 'is_flash_sale', 'flash_sale_end', 'kit_items'],
                            transaction
                        });
                        if (kitProduct && parseFloat(kitProduct.price) > 0) {
                            let effectiveKitPrice = parseFloat(kitProduct.price);
                            if (kitProduct.is_flash_sale && kitProduct.flash_sale_end && new Date(kitProduct.flash_sale_end) < new Date()) {
                                const op = parseFloat(kitProduct.old_price || 0);
                                if (op > 0) effectiveKitPrice = op;
                            }
                            let kitItemIds = [];
                            try { kitItemIds = typeof kitProduct.kit_items === 'string' ? JSON.parse(kitProduct.kit_items) : (kitProduct.kit_items || []); } catch (_) {}
                            const orderProductIds = items.map(i => String(i.product_id));
                            const allPresent = kitItemIds.length > 0 && kitItemIds.every(id => orderProductIds.includes(String(id)));
                            if (allPresent) {
                                const legacyComponents = await Product.findAll({
                                    where: { id: kitItemIds },
                                    attributes: ['id', 'price', 'old_price', 'is_flash_sale', 'flash_sale_end', 'boutique_id'],
                                    transaction
                                });
                                const currentBoutiqueId = product.boutique_id ? String(product.boutique_id) : null;
                                const allSameBoutique = currentBoutiqueId &&
                                    legacyComponents.every(c => c.boutique_id && String(c.boutique_id) === currentBoutiqueId);
                                if (allSameBoutique) {
                                    const totalOriginal = legacyComponents.reduce((sum, c) => {
                                        let cPrice = parseFloat(c.price || 0);
                                        if (c.is_flash_sale && c.flash_sale_end && new Date(c.flash_sale_end) < new Date()) {
                                            const cOld = parseFloat(c.old_price || 0);
                                            if (cOld > 0) cPrice = cOld;
                                        }
                                        return sum + cPrice;
                                    }, 0);
                                    if (totalOriginal > 0) {
                                        unitPrice = Math.round(basePrice * (effectiveKitPrice / totalOriginal));
                                    }
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.error("Error applying kit pricing during order creation:", e);
                }
            }

            subtotal += unitPrice * item.quantity;
            enrichedItems.push({ product, item, unitPrice, basePrice, variantData });
        }

        // Load configurations and address early for optimal boutique selection
        const customerAddress = await Address.findByPk(address_id, { transaction });
        const configs = await Config.findAll({ 
            where: { key: ['base_delivery_fee', 'intra_department_fee', 'inter_department_fee', 'crossing_fees'] },
            transaction 
        });
        const configMap = configs.reduce((acc, c) => ({ ...acc, [c.key]: c.value }), {});
        const deliveryTiers = await getDeliveryFeeTiers();
        const INTRA_DEPT_FEE = parseFloat(configMap['intra_department_fee'] || 500);
        const INTER_DEPT_FEE = parseFloat(configMap['inter_department_fee'] || 1000);
        
        let CROSSING_FEES = {};
        try { CROSSING_FEES = configMap['crossing_fees'] ? JSON.parse(configMap['crossing_fees']) : {}; } catch (e) {}

        const normalize = (s) => (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "").trim();
        const normalizedCCommune = customerAddress ? normalize(customerAddress.commune_label) : null;

        const calculateBoutiqueSupplement = (boutique) => {
            if (!boutique || !customerAddress) return INTER_DEPT_FEE;
            const normalizedBCommune = normalize(boutique.commune_label);
            if (String(boutique.commune_id) === String(customerAddress.commune_id) || 
                (normalizedBCommune && normalizedBCommune === normalizedCCommune)) {
                return 0;
            } else if (String(boutique.departement_id) === String(customerAddress.departement_id)) {
                return INTRA_DEPT_FEE;
            } else {
                const crossingKey = `${boutique.departement_id}-${customerAddress.departement_id}`;
                const reverseKey = `${customerAddress.departement_id}-${boutique.departement_id}`;
                if (CROSSING_FEES[crossingKey] !== undefined) return parseFloat(CROSSING_FEES[crossingKey]);
                if (CROSSING_FEES[reverseKey] !== undefined) return parseFloat(CROSSING_FEES[reverseKey]);
                return INTER_DEPT_FEE;
            }
        };

        // 2. Group items by optimal boutique (checking primary & secondary boutiques)
        const itemsByBoutique = {};
        for (const { product, item, unitPrice, basePrice, variantData } of enrichedItems) {
            let bestBoutiqueId = product.boutique_id || 'no_boutique';
            let minSupplement = Infinity;

            let candidateIds = [];
            if (product.boutique_id) candidateIds.push(product.boutique_id);
            try {
                const rawSec = product.secondary_boutique_ids;
                if (rawSec) {
                    if (Array.isArray(rawSec)) candidateIds.push(...rawSec);
                    else if (typeof rawSec === 'string') {
                        if (rawSec.startsWith('[')) candidateIds.push(...JSON.parse(rawSec));
                        else candidateIds.push(...rawSec.split(',').map(s=>s.trim()).filter(Boolean));
                    }
                }
            } catch(e) {}

            if (candidateIds.length > 0 && customerAddress) {
                const boutiques = await Boutique.findAll({ where: { id: candidateIds }, transaction });
                for (const b of boutiques) {
                    const supp = calculateBoutiqueSupplement(b);
                    if (supp < minSupplement) {
                        minSupplement = supp;
                        bestBoutiqueId = b.id;
                    }
                }
            }

            if (!itemsByBoutique[bestBoutiqueId]) itemsByBoutique[bestBoutiqueId] = [];
            itemsByBoutique[bestBoutiqueId].push({ product, item, unitPrice, basePrice, variantData });
        }

        const boutiqueIds = Object.keys(itemsByBoutique);
        const createdOrders = [];
        
        // 3. Coupon Logic — types 1 (bienvenue), 2 (pourcentage), 4 (livraison gratuite),
        // 7 (catégorie), 8 (personnel). Ceci est la vérification AUTORITATIVE côté serveur ;
        // /api/coupons/validate n'est qu'un aperçu côté client.
        let totalDiscount = 0;
        let couponFreeShipping = false;
        let couponBaseAmount = subtotal; // montant réellement soumis à la réduction (peut être < subtotal pour un coupon catégorie)
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
                let couponOk = true;

                if (validatedCoupon.usage_limit && validatedCoupon.used_count >= validatedCoupon.usage_limit) {
                    couponOk = false;
                }

                // Type 8 — code personnel : réservé à un client précis
                if (couponOk && validatedCoupon.assigned_user_id) {
                    if (!userId || validatedCoupon.assigned_user_id !== userId) couponOk = false;
                }

                // Type 1 — code de bienvenue : valable uniquement avant toute commande payée
                if (couponOk && validatedCoupon.first_order_only) {
                    if (!userId) {
                        couponOk = false;
                    } else {
                        const hasOrdered = await Order.findOne({ where: { user_id: userId, payment_status: 'payé' }, transaction });
                        if (hasOrdered) couponOk = false;
                    }
                }

                // Anti-fraude : un même compte ne réutilise pas un coupon déjà consommé
                if (couponOk && userId) {
                    const alreadyUsed = await CouponUsage.findOne({ where: { coupon_id: validatedCoupon.id, user_id: userId }, transaction });
                    if (alreadyUsed) couponOk = false;
                }

                // Type 7 — restreint à une catégorie : la base de calcul n'est que
                // le sous-total des articles de cette catégorie dans le panier.
                if (couponOk && validatedCoupon.category_id) {
                    couponBaseAmount = enrichedItems
                        .filter(({ product }) => String(product.category_id) === String(validatedCoupon.category_id))
                        .reduce((sum, { unitPrice, item }) => sum + unitPrice * item.quantity, 0);
                    if (couponBaseAmount <= 0) couponOk = false;
                }

                if (couponOk && couponBaseAmount < parseFloat(validatedCoupon.min_order_amount || 0)) {
                    couponOk = false;
                }

                if (couponOk) {
                    if (validatedCoupon.discount_type === 'free_shipping') {
                        // Type 4 — annule le supplément géographique de livraison (voir calculateBoutiqueSupplement
                        // plus bas) ; n'affecte jamais le BASE_FEE, déjà inclus dans le prix affiché du produit.
                        couponFreeShipping = true;
                    } else if (validatedCoupon.discount_type === 'percentage') {
                        totalDiscount = (couponBaseAmount * parseFloat(validatedCoupon.discount_value)) / 100;
                        if (validatedCoupon.max_discount_amount) {
                            totalDiscount = Math.min(totalDiscount, parseFloat(validatedCoupon.max_discount_amount));
                        }
                    } else {
                        totalDiscount = parseFloat(validatedCoupon.discount_value) || 0;
                    }
                    totalDiscount = Math.min(totalDiscount, couponBaseAmount);
                }

                if (!couponOk) {
                    // Coupon invalide dans ce contexte précis (limite atteinte, catégorie non présente,
                    // déjà utilisé…) : on l'ignore silencieusement plutôt que de bloquer la commande.
                    validatedCoupon = null;
                }
            }
        }
        const couponApplied = !!validatedCoupon && (totalDiscount > 0 || couponFreeShipping);

        // 4. Create individual orders per supplier

        // Paiement en ligne (fedapay/mobile_money/card) : la commande n'est
        // matérialisée qu'APRÈS confirmation réelle du paiement (voir
        // materializePendingCheckout plus bas, appelée par le webhook, le
        // callback de redirection, ou la confirmation explicite du widget
        // embarqué). On calcule et réserve le stock MAINTENANT (comme avant)
        // pour ne pas survendre pendant la fenêtre de paiement, mais on
        // n'écrit AUCUNE ligne `orders`/`order_items` tant que le paiement
        // n'est pas confirmé — le payload complet déjà calculé est stocké
        // tel quel dans PendingCheckout et rejoué sans recalcul à la
        // confirmation, pour ne jamais dupliquer cette logique de tarification.
        const isOnlinePayment = ['fedapay', 'mobile_money', 'card'].includes(payment_method);
        const pendingBoutiqueOrders = [];

        for (const bId of boutiqueIds) {
            const boutiqueItems = itemsByBoutique[bId];
            const actualBoutiqueId = bId === 'no_boutique' ? null : bId;
            
            let actualSupplierId = null;
            let boutique = null;
            let targetPhone = null;

            if (actualBoutiqueId) {
                boutique = await Boutique.findByPk(actualBoutiqueId, {
                    include: [{ model: Supplier, as: 'supplier', include: [{ model: Profile, as: 'user' }] }],
                    transaction
                });
                if (boutique) {
                    actualSupplierId = boutique.supplier_id;
                    targetPhone = boutique.whatsapp || boutique.phone || boutique.supplier?.whatsapp || boutique.supplier?.phone || boutique.supplier?.user?.phone;
                }
            }

            if (!actualSupplierId && boutiqueItems.length > 0) {
                actualSupplierId = boutiqueItems[0].product.supplier_id;
                if (actualSupplierId && !targetPhone) {
                    const fallbackSupplier = await Supplier.findByPk(actualSupplierId, { include: [{ model: Profile, as: 'user' }], transaction });
                    if (fallbackSupplier) {
                        targetPhone = fallbackSupplier.whatsapp || fallbackSupplier.phone || fallbackSupplier.user?.phone;
                    }
                }
            }


            let bSubtotal = boutiqueItems.reduce((sum, bi) => sum + (bi.unitPrice * bi.item.quantity), 0);
            
            // Calcul dynamique des frais de livraison pour CETTE boutique précise
            let supplement = calculateBoutiqueSupplement(boutique);

            const firstItemPrice = boutiqueItems[0].product.supplier_price || 0;
            const BASE_FEE = computeDeliveryFee(firstItemPrice, deliveryTiers);

            // Pour le client, on n'affiche que le supplément géographique (intra/inter).
            // Le BASE_FEE marketing est déjà inclus dans le prix affiché du produit.
            // Un coupon "livraison gratuite" annule ce supplément (jamais le BASE_FEE).
            let sDeliveryFee = couponFreeShipping ? 0 : supplement;

            // Répartition de la réduction entre les commandes-boutique : si le coupon est
            // restreint à une catégorie, on répartit uniquement sur la part de CETTE boutique
            // dans le sous-total éligible (pas le sous-total global) pour ne pas remiser les
            // articles hors catégorie d'une autre boutique.
            let bDiscountBase = bSubtotal;
            if (validatedCoupon && validatedCoupon.category_id) {
                bDiscountBase = boutiqueItems
                    .filter(({ product }) => String(product.category_id) === String(validatedCoupon.category_id))
                    .reduce((sum, { unitPrice, item }) => sum + unitPrice * item.quantity, 0);
            }
            const orderShareOfDiscountBase = couponBaseAmount > 0 ? (bDiscountBase / couponBaseAmount) : 0;
            const sDiscount = totalDiscount * orderShareOfDiscountBase;
            const sTotal = (bSubtotal - sDiscount) + sDeliveryFee;
            
            const deliveryCode = Math.floor(1000 + Math.random() * 9000).toString();
            const orderId = crypto.randomUUID();

            // Payload commun aux deux chemins (créé tout de suite vs différé) —
            // c'est littéralement ce qui deviendra les colonnes `orders` une
            // fois la commande matérialisée (immédiatement ci-dessous, ou plus
            // tard dans materializePendingCheckout pour le paiement en ligne).
            const orderPayload = {
                id: orderId,
                user_id: userId,
                guest_name, guest_email, guest_phone,
                address_id,
                payment_method: payment_method || 'delivery',
                whatsapp_notif_phone,
                total_amount: sTotal,
                delivery_fee: sDeliveryFee,
                discount_amount: sDiscount,
                coupon_code: couponApplied ? coupon_code : null,
                notes,
                delivery_code: deliveryCode,
                supplier_id: actualSupplierId,
                boutique_id: actualBoutiqueId,
                items_count: boutiqueItems.length
            };

            const order = isOnlinePayment ? null : await Order.create({
                ...orderPayload,
                payment_status: 'en_attente',
                status: 'en_attente'
            }, { transaction });

            const itemPayloads = [];

            for (const { product, item, unitPrice, basePrice, variantData } of boutiqueItems) {
                // Determine the best original_price for display: volume-discount base or product/variant old_price
                const variantOldPrice = variantData ? parseFloat(variantData.old_price || 0) : 0;
                const productOldPrice = parseFloat(product.old_price || 0);
                const displayOldPrice = variantOldPrice > unitPrice ? variantOldPrice
                    : productOldPrice > unitPrice ? productOldPrice
                    : null;
                const storeOriginalPrice = basePrice !== unitPrice ? basePrice : displayOldPrice;

                const itemPayload = {
                    product_id: product.id,
                    variant_id: variantData?.variant_id || null,
                    boutique_id: actualBoutiqueId,
                    quantity: item.quantity,
                    price: unitPrice,
                    original_price: storeOriginalPrice
                };

                if (isOnlinePayment) {
                    itemPayloads.push(itemPayload);
                } else {
                    await OrderItem.create({ order_id: order.id, ...itemPayload }, { transaction }).catch(async (createErr) => {
                        // If original_price column doesn't exist yet, retry without it
                        if (createErr.message?.includes('original_price')) {
                            const { original_price, ...rest } = itemPayload;
                            return OrderItem.create({ order_id: order.id, ...rest }, { transaction });
                        }
                        throw createErr;
                    });
                    // Compte les ventes tout de suite pour ce mode de paiement
                    // (livraison/portefeuille) — pour le paiement en ligne, voir
                    // materializePendingCheckout : on ne compte une vente qu'une
                    // fois le paiement réellement confirmé, pas à la simple tentative.
                    await product.increment('total_sold', { by: item.quantity, transaction });
                }

                // On RÉSERVE la quantité MAINTENANT dans tous les cas (stock
                // physique intact) — que la commande soit créée tout de suite
                // ou différée jusqu'à confirmation du paiement, il faut retenir
                // le stock pendant la fenêtre de paiement pour ne pas survendre.
                // Le stock réel n'est décrémenté qu'à la livraison confirmée
                // (voir updateOrderStatus).
                if (variantData) {
                    await variantData.increment('reserved_stock', { by: item.quantity, transaction });
                    await variantData.reload({ transaction });
                    const availableAfter = variantData.stock - variantData.reserved_stock;
                    if (availableAfter <= 5 && actualSupplierId) {
                        Supplier.findByPk(actualSupplierId, { include: [{ model: Profile, as: 'user' }] }).then(s => {
                            const phone = s?.whatsapp || s?.phone || s?.user?.phone;
                            if (phone) notifySupplierOfLowStock(phone, `${product.name} (${variantData.variant_id})`, availableAfter);
                        }).catch(() => {});
                    }
                } else if (product.stock !== undefined) {
                    await product.increment('reserved_stock', { by: item.quantity, transaction });
                    await product.reload({ transaction });
                }
            }

            if (isOnlinePayment) {
                pendingBoutiqueOrders.push({ ...orderPayload, items: itemPayloads });
            } else {
                createdOrders.push(order);

                // WhatsApp notif to supplier is sent only after admin confirms (see updateOrderStatus)

                // WhatsApp Notif to Customer (Priority to dedicated phone)
                const customerWhatsApp = whatsapp_notif_phone || guest_phone;
                if (customerWhatsApp) {
                    sendNewOrderWhatsApp(customerWhatsApp, order.id, order.total_amount).catch(e => console.error("WA CUST NOTIF ERR:", e));
                }
            }
        }

        // Paiement en ligne : commande différée jusqu'à confirmation — on
        // enregistre le payload complet (déjà entièrement calculé/tarifé
        // ci-dessus) dans PendingCheckout, sans toucher au panier ni au
        // coupon (consommés seulement si le paiement aboutit, voir
        // materializePendingCheckout). Le stock est déjà réservé (boucle
        // ci-dessus) — c'est ce qui empêche la survente pendant que le
        // client est sur la page de paiement FedaPay.
        if (isOnlinePayment) {
            const pendingCheckout = await PendingCheckout.create({
                id: crypto.randomUUID(),
                user_id: userId,
                payload: JSON.stringify({
                    boutiqueOrders: pendingBoutiqueOrders,
                    coupon: (validatedCoupon && couponApplied)
                        ? { id: validatedCoupon.id, discount_amount: totalDiscount }
                        : null
                }),
                status: 'pending'
            }, { transaction });

            await transaction.commit();

            const totalCartAmount = pendingBoutiqueOrders.reduce((sum, o) => sum + o.total_amount, 0);
            try {
                const customerProfile = userId ? await Profile.findByPk(userId) : null;
                const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
                const callbackUrl = `${backendUrl}/api/payments/fedapay-callback?order_id=${pendingCheckout.id}`;
                const fedapayOrderObj = { id: pendingCheckout.id, total_amount: totalCartAmount };

                const fedaTx = await createFedapayTransaction(fedapayOrderObj, customerProfile, callbackUrl, { type: 'pending_checkout' });

                await pendingCheckout.update({ fedapay_transaction_id: fedaTx.transactionId });

                return res.status(201).json({
                    message: 'Paiement en cours',
                    pending_checkout_id: pendingCheckout.id,
                    payment_url: fedaTx.checkoutUrl,
                    transaction_id: fedaTx.transactionId,
                    // Voir CheckoutPage.jsx — indispensable pour ouvrir la modale
                    // FedaPay intégrée au lieu de rediriger en pleine page.
                    token: fedaTx.token,
                    amount: totalCartAmount
                });
            } catch (fedaError) {
                console.error('CREATE ORDER (PENDING CHECKOUT) FEDAPAY ERROR:', fedaError);
                // Le lien de paiement n'a jamais pu être généré : on relâche la
                // réservation de stock tout de suite plutôt que d'attendre le
                // cron d'expiration (30min) — rien ne sert de la garder puisque
                // cette tentative de paiement n'aboutira jamais.
                await releasePendingCheckoutReservation(pendingCheckout).catch(() => {});
                await pendingCheckout.update({ status: 'failed' }).catch(() => {});
                return res.status(500).json({
                    error: 'Erreur lors de la génération du lien de paiement. Votre panier est intact, vous pouvez réessayer.'
                });
            }
        }

        if (userId) {
            await Cart.destroy({ where: { user_id: userId }, transaction });
        }
        if (validatedCoupon && couponApplied) {
            await validatedCoupon.increment('used_count', { by: 1, transaction });
            await CouponUsage.create({
                id: crypto.randomUUID(),
                coupon_id: validatedCoupon.id,
                user_id: userId,
                order_id: createdOrders[0]?.id || null,
                discount_amount: totalDiscount
            }, { transaction });
        }

        // --- FINAL WALLET DEBIT ---
        if (payment_method === 'wallet') {
            const grandTotal = createdOrders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
            
            // Re-fetch balance inside transaction to be sure
            const summary = await FinancialTransaction.findAll({
                where: { 
                    user_id: userId, 
                    status: 'completed',
                    [Op.or]: [
                        { source: { [Op.ne]: 'admin_commission' } },
                        { source: null }
                    ]
                },
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

        const mainParentId = createdOrders[0].id;
        for (let i = 0; i < createdOrders.length; i++) {
            await createdOrders[i].update({ 
                parent_id: mainParentId,
                is_parent: i === 0 
            }, { transaction });
        }

        await transaction.commit();

        const allOrderIds = createdOrders.map(o => o.id);
        const mainOrder = createdOrders[0];
        let totalCartAmount = createdOrders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);

        // Group notification for Admin
        const orderListStr = allOrderIds.map(id => `#${id.slice(0, 8)}`).join(', ');
        notifyAdmin(`🛍️ Nouvelle commande Multi-Boutiques (${createdOrders.length}) !\nIDs: ${orderListStr}\nClient: ${guest_name || 'Inconnu'}\nTotal: ${totalCartAmount} F`).catch(() => {});

        // Fetch user email once for invoice (logged-in users don't have guest_email on the order)
        let invoiceEmail = guest_email || null;
        if (!invoiceEmail && userId) {
            try {
                const up = await Profile.findByPk(userId, { attributes: ['email'] });
                invoiceEmail = up?.email || null;
            } catch (_) {}
        }

        // Send individual notifications for each split
        for (const order of createdOrders) {
            const orderItems = enrichedItems.filter(ei => (ei.product.boutique_id || 'no_boutique') === (order.boutique_id || 'no_boutique'));
            sendOrderNotificationToAdmin(order).catch(() => {});
            const orderForInvoice = invoiceEmail ? { ...order.toJSON(), user_email: invoiceEmail } : order;
            sendInvoiceEmail(orderForInvoice, orderItems.map(e => ({ ...e.item, product: e.product, unit_price: e.unitPrice }))).catch(() => {});
        }
        
        // WhatsApp Notif to Customer
        const customerPhone = guest_phone || (userId ? (await Profile.findByPk(userId))?.phone : null);
        if (customerPhone) sendNewOrderWhatsApp(customerPhone, mainOrder.id, totalCartAmount).catch(() => {});

        // Note : le cas paiement en ligne (fedapay/mobile_money/card) est
        // entièrement géré plus haut (branche isOnlinePayment) et retourne
        // avant d'atteindre ce point — cette fonction ne peut arriver ici
        // qu'avec un mode de paiement livraison/portefeuille déjà confirmé.
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

// =====================================================================
// PAIEMENT EN LIGNE DIFFÉRÉ — libération de réservation + matérialisation
// =====================================================================
// Relâche la réservation de stock d'un PendingCheckout qui n'aboutira
// jamais (échec immédiat de génération du lien FedaPay, ou expiration —
// voir orderExpiryService.js). Aucune commande n'a jamais existé pour lui,
// donc il n'y a que la réservation à défaire, pas de stock physique à
// restaurer (jamais décrémenté avant la livraison).
export const releasePendingCheckoutReservation = async (pendingCheckout) => {
    try {
        const payload = JSON.parse(pendingCheckout.payload);
        for (const bo of (payload.boutiqueOrders || [])) {
            for (const it of (bo.items || [])) {
                if (it.variant_id) {
                    await ProductVariantPrice.decrement('reserved_stock', { by: it.quantity, where: { variant_id: it.variant_id } });
                } else if (it.product_id) {
                    await Product.decrement('reserved_stock', { by: it.quantity, where: { id: it.product_id } });
                }
            }
        }
    } catch (err) {
        console.error('[releasePendingCheckoutReservation] Error:', err);
    }
};

// Matérialise réellement la/les commande(s) d'un PendingCheckout confirmé —
// appelée par le webhook FedaPay, le callback de redirection, ET la
// confirmation explicite envoyée par le widget embarqué (onComplete côté
// frontend) : les trois peuvent arriver pour le même paiement, d'où
// l'idempotence stricte sur pending.status. Rejoue tel quel le payload déjà
// entièrement calculé/tarifé au moment du checkout (voir createOrder) —
// aucune logique de prix/coupon/kit n'est recalculée ici, seulement de la
// persistance + les effets de bord (panier, coupon, notifications).
export const materializePendingCheckout = async (pendingCheckoutId) => {
    const pending = await PendingCheckout.findByPk(pendingCheckoutId);
    if (!pending) return null;

    if (pending.status === 'confirmed') {
        try {
            const ids = JSON.parse(pending.resulting_order_ids || '[]');
            return ids.length ? await Order.findByPk(ids[0]) : null;
        } catch {
            return null;
        }
    }
    if (pending.status !== 'pending') return null; // expired/failed — trop tard, il faut recommencer le checkout

    const payload = JSON.parse(pending.payload);
    const { boutiqueOrders, coupon } = payload;
    if (!Array.isArray(boutiqueOrders) || boutiqueOrders.length === 0) return null;

    const transaction = await sequelize.transaction();
    try {
        const createdOrders = [];
        for (const bo of boutiqueOrders) {
            const order = await Order.create({
                id: bo.id,
                user_id: bo.user_id,
                guest_name: bo.guest_name,
                guest_email: bo.guest_email,
                guest_phone: bo.guest_phone,
                address_id: bo.address_id,
                payment_method: bo.payment_method,
                payment_status: 'payé',
                status: 'en_attente',
                whatsapp_notif_phone: bo.whatsapp_notif_phone,
                total_amount: bo.total_amount,
                delivery_fee: bo.delivery_fee,
                discount_amount: bo.discount_amount,
                coupon_code: bo.coupon_code,
                notes: bo.notes,
                delivery_code: bo.delivery_code,
                supplier_id: bo.supplier_id,
                boutique_id: bo.boutique_id,
                items_count: bo.items_count
            }, { transaction });

            for (const it of (bo.items || [])) {
                await OrderItem.create({
                    order_id: order.id,
                    product_id: it.product_id,
                    variant_id: it.variant_id,
                    boutique_id: it.boutique_id,
                    quantity: it.quantity,
                    price: it.price,
                    original_price: it.original_price
                }, { transaction }).catch(async (createErr) => {
                    if (createErr.message?.includes('original_price')) {
                        return OrderItem.create({
                            order_id: order.id, product_id: it.product_id, variant_id: it.variant_id,
                            boutique_id: it.boutique_id, quantity: it.quantity, price: it.price
                        }, { transaction });
                    }
                    throw createErr;
                });
                // Compte la vente seulement maintenant, paiement réellement
                // confirmé — pas à la simple tentative (voir createOrder).
                await Product.increment('total_sold', { by: it.quantity, where: { id: it.product_id }, transaction });
            }
            createdOrders.push(order);
        }

        const mainParentId = createdOrders[0].id;
        for (let i = 0; i < createdOrders.length; i++) {
            await createdOrders[i].update({ parent_id: mainParentId, is_parent: i === 0 }, { transaction });
        }

        const anyBo = boutiqueOrders[0];
        if (anyBo.user_id) {
            await Cart.destroy({ where: { user_id: anyBo.user_id }, transaction });
        }

        if (coupon) {
            await Coupon.increment('used_count', { by: 1, where: { id: coupon.id }, transaction });
            await CouponUsage.create({
                id: crypto.randomUUID(),
                coupon_id: coupon.id,
                user_id: anyBo.user_id || null,
                order_id: mainParentId,
                discount_amount: coupon.discount_amount
            }, { transaction });
        }

        await pending.update({
            status: 'confirmed',
            resulting_order_ids: JSON.stringify(createdOrders.map(o => o.id))
        }, { transaction });

        await transaction.commit();

        // --- Notifications (hors transaction, best-effort — même schéma que le flux immédiat) ---
        const totalCartAmount = createdOrders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
        const orderListStr = createdOrders.map(o => `#${o.id.slice(0, 8)}`).join(', ');
        notifyAdmin(`🛍️ Nouvelle commande${createdOrders.length > 1 ? ' Multi-Boutiques' : ''} payée en ligne !\nIDs: ${orderListStr}\nTotal: ${totalCartAmount.toLocaleString()} F`).catch(() => {});

        let invoiceEmail = anyBo.guest_email || null;
        if (!invoiceEmail && anyBo.user_id) {
            try {
                const up = await Profile.findByPk(anyBo.user_id, { attributes: ['email'] });
                invoiceEmail = up?.email || null;
            } catch (_) { /* ignore */ }
        }

        for (const order of createdOrders) {
            const items = await OrderItem.findAll({
                where: { order_id: order.id },
                include: [{ model: Product, as: 'product' }]
            });
            sendOrderNotificationToAdmin(order).catch(() => {});
            const orderForInvoice = invoiceEmail ? { ...order.toJSON(), user_email: invoiceEmail } : order;
            sendInvoiceEmail(orderForInvoice, items).catch(() => {});
        }

        const customerPhone = anyBo.guest_phone || (anyBo.user_id ? (await Profile.findByPk(anyBo.user_id))?.phone : null);
        if (customerPhone) sendNewOrderWhatsApp(customerPhone, mainParentId, totalCartAmount).catch(() => {});

        sendMetaCapiEvent({
            eventName: 'Purchase',
            eventSourceUrl: `${process.env.FRONTEND_URL || 'https://vtout.com'}/checkout/success`,
            customData: { currency: 'XOF', value: totalCartAmount }
        }).catch(() => {});

        return createdOrders[0];
    } catch (err) {
        await transaction.rollback();
        // Course concurrente possible : webhook, callback de redirection et
        // confirmation explicite du widget peuvent arriver quasi simultanément
        // pour le MÊME paiement. Si un autre appel a déjà matérialisé entre-
        // temps (échec ici dû à la clé primaire déjà prise sur Order.create),
        // on renvoie simplement le résultat déjà créé plutôt que de remonter
        // une erreur pour un paiement qui, en réalité, a bien réussi.
        try {
            const refreshed = await PendingCheckout.findByPk(pendingCheckoutId);
            if (refreshed?.status === 'confirmed') {
                const ids = JSON.parse(refreshed.resulting_order_ids || '[]');
                if (ids.length) return await Order.findByPk(ids[0]);
            }
        } catch { /* on retombe sur l'erreur d'origine ci-dessous */ }
        console.error('[materializePendingCheckout] Error:', err);
        throw err;
    }
};

// Endpoint appelé par le widget FedaPay embarqué (onComplete côté
// CheckoutPage.jsx) dès que le navigateur signale un paiement terminé — on
// ne fait JAMAIS confiance à ce signal client seul : re-vérification
// serveur-à-serveur via verifyFedapayTransaction avant de matérialiser quoi
// que ce soit. Le webhook et le callback de redirection couvrent déjà le
// cas où l'utilisateur ferme l'onglet avant que cet appel ne parte — cet
// endpoint n'est qu'un raccourci pour une confirmation immédiate côté UI.
// Infos publiques minimales d'un PendingCheckout (montant, statut) — sert à
// la page de reprise de paiement (lien envoyé dans la relance WhatsApp/email,
// voir orderExpiryService.js remindPendingCheckouts) avant que le client ne
// clique sur "Reprendre le paiement". Pas d'auth requise (guests inclus),
// aucune donnée sensible exposée (ni adresse, ni contact).
export const getPendingCheckout = async (req, res) => {
    try {
        const { id } = req.params;
        const pending = await PendingCheckout.findByPk(id);
        if (!pending) return res.status(404).json({ error: 'Paiement introuvable' });

        if (pending.user_id && req.auth?.userId && req.auth.userId !== pending.user_id) {
            return res.status(403).json({ error: 'Non autorisé' });
        }

        let amount = 0;
        let itemsCount = 0;
        try {
            const payload = JSON.parse(pending.payload);
            amount = (payload.boutiqueOrders || []).reduce((sum, o) => sum + o.total_amount, 0);
            itemsCount = (payload.boutiqueOrders || []).reduce((sum, o) => sum + (o.items?.length || 0), 0);
        } catch { /* payload illisible — on renvoie quand même le statut */ }

        // Si déjà confirmé, on renvoie directement l'id de commande réelle pour
        // que la page de reprise puisse rediriger sans repasser par confirm.
        let orderId = null;
        if (pending.status === 'confirmed') {
            try {
                const ids = JSON.parse(pending.resulting_order_ids || '[]');
                orderId = ids[0] || null;
            } catch { /* ignore */ }
        }

        res.json({ id: pending.id, status: pending.status, amount, items_count: itemsCount, order_id: orderId });
    } catch (error) {
        console.error('GET PENDING CHECKOUT ERROR:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du paiement' });
    }
};

export const confirmPendingCheckout = async (req, res) => {
    try {
        const { id } = req.params;
        const { transaction_id } = req.body;
        if (!transaction_id) return res.status(400).json({ error: 'transaction_id manquant' });

        const pending = await PendingCheckout.findByPk(id);
        if (!pending) return res.status(404).json({ error: 'Paiement introuvable' });

        if (pending.status === 'confirmed') {
            const order = await materializePendingCheckout(id); // idempotent, retourne l'existant
            return res.json({ order: order?.toJSON() || null });
        }
        if (pending.status !== 'pending') {
            return res.status(400).json({ error: 'Ce paiement a expiré ou échoué. Merci de recommencer votre commande.' });
        }

        const fedaTx = await verifyFedapayTransaction(transaction_id);
        const txPendingId = fedaTx?.custom_metadata?.order_id || fedaTx?.metadata?.order_id;
        if (!txPendingId || !txPendingId.includes(id)) {
            console.error('[Confirm Pending Checkout] Transaction/pending mismatch — tentative de fraude potentielle.');
            return res.status(403).json({ error: 'Transaction non reconnue pour ce paiement.' });
        }
        if (fedaTx.status !== 'approved') {
            return res.status(400).json({ error: 'Paiement non confirmé.' });
        }

        const order = await materializePendingCheckout(id);
        if (!order) return res.status(500).json({ error: 'Erreur lors de la création de la commande.' });

        res.json({ order: order.toJSON() });
    } catch (error) {
        console.error('CONFIRM PENDING CHECKOUT ERROR:', error);
        res.status(500).json({ error: 'Erreur lors de la confirmation du paiement.' });
    }
};

// =====================================================================
// RETRY PAYMENT — self-service pour un paiement en ligne qui a échoué
// =====================================================================
// Avant ce endpoint, un client dont le paiement FedaPay échouait au
// checkout n'avait AUCUN moyen de repayer lui-même : la commande restait
// "en attente" jusqu'à un contact manuel de l'équipe, ou était
// auto-annulée après 30min (voir orderExpiryService.js). On régénère ici
// une nouvelle transaction FedaPay pour une commande déjà créée, sans
// toucher au stock (déjà réservé depuis la création) ni recréer de ligne
// de commande.
//
// Pas de requireAuth : les commandes invitées doivent pouvoir être
// repayées sans compte, même modèle de confiance par UUID que
// /order-confirmation/:id déjà utilisé côté frontend pour les invités.
// Seule restriction : si la commande appartient à un compte ET qu'un
// AUTRE compte est actuellement connecté, on bloque.
export const retryOrderPayment = async (req, res) => {
    try {
        const { id } = req.params;

        // Cas 1 : une vraie commande existe déjà pour cet id (flux legacy —
        // commandes créées avant ce changement d'architecture, ou tout mode
        // de paiement qui crée toujours la commande immédiatement).
        const order = await Order.findByPk(id);
        if (order) {
            if (order.user_id && req.auth?.userId && req.auth.userId !== order.user_id) {
                return res.status(403).json({ error: 'Non autorisé' });
            }
            if (!['fedapay', 'mobile_money', 'card'].includes(order.payment_method)) {
                return res.status(400).json({ error: "Cette commande n'est pas un paiement en ligne." });
            }
            if (order.payment_status === 'payé') {
                return res.status(400).json({ error: 'Cette commande est déjà payée.' });
            }
            if (['annulée', 'livrée', 'retournée'].includes(order.status)) {
                return res.status(400).json({ error: `Cette commande ne peut plus être payée (statut : ${order.status}).` });
            }

            // Commande scindée multi-boutiques : on régénère un paiement pour
            // TOUT le groupe (même logique que createOrder), pas seulement la
            // commande-boutique individuelle passée en paramètre.
            const parentId = order.parent_id || order.id;
            const groupOrders = await Order.findAll({
                where: { [Op.or]: [{ id: parentId }, { parent_id: parentId }] }
            });
            const mainOrder = groupOrders.find(o => o.is_parent) || groupOrders[0] || order;
            const totalAmount = groupOrders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);

            const customerProfile = order.user_id ? await Profile.findByPk(order.user_id) : null;
            const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
            const callbackUrl = `${backendUrl}/api/payments/fedapay-callback?order_id=${mainOrder.id}`;

            const fedapayOrderObj = { ...mainOrder.toJSON(), total_amount: totalAmount };
            fedapayOrderObj.id = groupOrders.map(o => o.id).join(',');

            const fedaTx = await createFedapayTransaction(fedapayOrderObj, customerProfile, callbackUrl);

            return res.json({
                payment_url: fedaTx.checkoutUrl,
                transaction_id: fedaTx.transactionId,
                token: fedaTx.token,
                amount: totalAmount
            });
        }

        // Cas 2 : pas de commande — un PendingCheckout en attente de paiement
        // (flux différé, voir createOrder) peut exister à cet id à la place.
        // Régénère juste un nouveau lien FedaPay pour le MÊME payload déjà
        // calculé (la réservation de stock reste inchangée) ; en pratique le
        // checkout gère déjà ça côté frontend sans repasser par cet endpoint
        // (l'utilisateur peut retenter directement depuis la page), mais on
        // le garde pour toute réutilisation externe (lien, support…).
        const pending = await PendingCheckout.findByPk(id);
        if (pending) {
            if (pending.user_id && req.auth?.userId && req.auth.userId !== pending.user_id) {
                return res.status(403).json({ error: 'Non autorisé' });
            }
            if (pending.status !== 'pending') {
                return res.status(400).json({ error: 'Ce paiement a expiré ou a déjà été traité. Merci de recommencer votre commande.' });
            }

            const payload = JSON.parse(pending.payload);
            const totalAmount = (payload.boutiqueOrders || []).reduce((sum, o) => sum + o.total_amount, 0);
            const customerProfile = pending.user_id ? await Profile.findByPk(pending.user_id) : null;
            const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
            const callbackUrl = `${backendUrl}/api/payments/fedapay-callback?order_id=${pending.id}`;
            const fedapayOrderObj = { id: pending.id, total_amount: totalAmount };

            const fedaTx = await createFedapayTransaction(fedapayOrderObj, customerProfile, callbackUrl, { type: 'pending_checkout' });
            await pending.update({ fedapay_transaction_id: fedaTx.transactionId });

            return res.json({
                pending_checkout_id: pending.id,
                payment_url: fedaTx.checkoutUrl,
                transaction_id: fedaTx.transactionId,
                token: fedaTx.token,
                amount: totalAmount
            });
        }

        return res.status(404).json({ error: 'Commande introuvable' });
    } catch (error) {
        console.error('RETRY PAYMENT ERROR:', error);
        res.status(500).json({ error: 'Erreur lors de la génération du lien de paiement. Réessayez plus tard.' });
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

        const oldStatus = order.status;

        const STATUS_MAP = {
            'livree': 'livrée',
            'expediee': 'expédiée',
            'confirmee': 'confirmée',
            'assignee': 'assignée',
            'annulee': 'annulée',
            'retournee': 'retournée'
        };
        const mappedStatus = STATUS_MAP[status] || status;

        // Authorization checks
        const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
        const userEmail = req.auth?.email?.toLowerCase();
        const isAdmin = role === 'admin' || (userEmail && adminEmails.includes(userEmail));

        if (!isAdmin) {
            const isOrderOwner = order.user_id && order.user_id === userId;

            // Allow the order owner to cancel their own pending order
            if (isOrderOwner && mappedStatus === 'annulée' && (oldStatus === 'en_attente' || oldStatus === 'en attente')) {
                // Permitted — falls through to update logic below
            } else {
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
                if (mappedStatus === 'livrée') {
                    if (!order.delivery_person_id) {
                        return res.status(400).json({ error: 'Un livreur doit être assigné pour confirmer la livraison.' });
                    }
                    if (!isOrderRider) {
                        return res.status(403).json({ error: 'Seul le livreur désigné peut confirmer la livraison.' });
                    }
                }

                if (isOrderSupplier && !isOrderRider && !['confirmée', 'expédiée', 'annulée'].includes(mappedStatus)) {
                    return res.status(403).json({ error: 'Action non autorisée pour un fournisseur.' });
                }
            }
        }
        
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
            if (mappedStatus === 'confirmée') {
                updatePayload.confirmed_at = now;
                // Notify supplier now that admin has confirmed — order is visible and ready to prepare
                if (order.supplier_id) {
                    Supplier.findByPk(order.supplier_id, { include: [{ model: Boutique }] }).then(s => {
                        const phone = s?.whatsapp || s?.phone;
                        if (phone) notifySupplierOfNewOrder(phone, order.id, order.total_amount).catch(() => {});
                    }).catch(() => {});
                }
            }
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

        // Libère la réservation d'une commande annulée avant livraison — le stock
        // physique réel n'a jamais été touché pour cette commande (voir création),
        // donc on relâche reserved_stock, pas stock. Correction au passage d'un bug
        // pré-existant : ProductVariant n'a pas de colonne stock (c'est
        // ProductVariantPrice qui la porte) — l'ancien code ne restaurait donc
        // jamais rien pour les produits à variantes.
        if (mappedStatus === 'annulée' && (oldStatus === 'en_attente' || oldStatus === 'en attente')) {
            const items = await OrderItem.findAll({ where: { order_id: order.id } });
            for (const item of items) {
                if (item.variant_id) {
                    await ProductVariantPrice.decrement('reserved_stock', { by: item.quantity, where: { variant_id: item.variant_id } });
                } else if (item.product_id) {
                    await Product.decrement('reserved_stock', { by: item.quantity, where: { id: item.product_id } });
                }
            }
        }

        // WhatsApp Notif to Customer (avec repli email si Green API échoue)
        try {
            const userProfile = await Profile.findByPk(order.user_id);
            const customerPhone = order.whatsapp_notif_phone || order.guest_phone || userProfile?.phone;
            const customerEmail = order.guest_email || userProfile?.email || null;
            if (customerPhone && status) {
                notifyCustomerOfStatusUpdate(customerPhone, order.id, mappedStatus, customerEmail).catch(() => {});
            }
        } catch (_) {}

        // WhatsApp Notif to Supplier
        if (order.supplier_id && status) {
            Supplier.findByPk(order.supplier_id, { include: [{ model: Profile, as: 'user' }] }).then(s => {
                const phone = s?.whatsapp || s?.phone || s?.user?.phone;
                if (phone) {
                    notifySupplierOfOrderStatusUpdate(phone, order.id, mappedStatus).catch(() => {});
                }
            }).catch(() => {});
        }

        // WhatsApp Notif to Deliverer (if assigned in this request)
        if (req.body.delivery_person_id) {
            DeliveryPerson.findByPk(req.body.delivery_person_id, { include: [{ model: Profile, as: 'profile' }] }).then(deliverer => {
                const phone = deliverer?.phone || deliverer?.profile?.phone;
                if (phone) notifyDelivererOfAssignment(phone, order.id);
            });
        }

        // WhatsApp Notif to Deliverer (if already assigned and not just assigned in req.body)
        if (order.delivery_person_id && !req.body.delivery_person_id && status) {
            DeliveryPerson.findByPk(order.delivery_person_id, { include: [{ model: Profile, as: 'profile' }] }).then(deliverer => {
                const phone = deliverer?.phone || deliverer?.profile?.phone || deliverer?.whatsapp;
                if (phone) {
                    const statusMessages = {
                        'confirmée': 'est maintenant confirmée par le client et est prête pour la préparation/récupération.',
                        'expédiée': 'est maintenant expédiée ! Le colis est en transit.',
                        'livrée': 'a été marquée comme livrée.',
                        'annulée': 'a été annulée. Veuillez ne pas effectuer la livraison.',
                        'retournée': 'a été marquée comme retournée.'
                    };
                    const msg = statusMessages[mappedStatus];
                    if (msg) {
                        sendWhatsAppMessage(phone, `🛵 *VTOUT : Statut de course modifié*\nLa commande #${order.id.slice(0, 8).toUpperCase()} ${msg}`).catch(() => {});
                    }
                }
            }).catch(e => console.error("Error notifying deliverer in updateOrderStatus:", e));
        }

        // WhatsApp Notif to Admin
        if (status) {
            notifyAdmin(`🔔 *VTOUT : Statut de commande modifié*\nCommande: #${order.id.slice(0, 8).toUpperCase()}\nStatut: *${oldStatus}* ➔ *${mappedStatus}*`).catch(() => {});
        }

        // Récompense de parrainage — fire-and-forget, ne récompense que si
        // le parrainage était "pending" et que l'admin a fixé un montant > 0.
        if (mappedStatus === 'confirmée' && oldStatus === 'en_attente' && order.user_id) {
            rewardReferrerIfPending(order.user_id, order.id).catch((e) =>
                console.error('[Referral] rewardReferrerIfPending failed:', e.message)
            );
        }

        // 1. (ancien emplacement de la décrémentation de stock à la confirmation —
        // supprimé : le stock réel n'est plus touché ici. Il est décrémenté une
        // seule fois, à la livraison confirmée, juste ci-dessous. L'alerte "stock
        // bas" est désormais envoyée dès la réservation, à la création de la
        // commande, voir createOrder.)

        // 2. Financial logging on delivery — DOIT s'exécuter avant la consommation
        // de stock ci-dessous : en cas d'échec, le statut est reverti (early
        // return), donc on ne veut surtout pas avoir déjà décrémenté le stock
        // réel pour une livraison qui, finalement, ne sera pas actée.
        const isDelivered = (mappedStatus === 'livrée') && (oldStatus !== 'livrée');
        if (isDelivered) {
            try {
                await processOrderFinancials(order.id);
            } catch (financialErr) {
                console.error(`[ROLLBACK] processOrderFinancials failed for order ${order.id}, reverting status:`, financialErr);
                await order.update({ status: oldStatus });
                return res.status(500).json({ error: 'Erreur lors du traitement financier. Le statut a été restauré. Veuillez réessayer.' });
            }
        }

        // 3. Consommation réelle du stock à la LIVRAISON confirmée (seulement
        // atteint si le traitement financier ci-dessus a réussi) — c'est le seul
        // moment où le stock physique baisse vraiment. On relâche la réservation
        // en même temps (la vente est désormais définitive, plus "en attente").
        if (isDelivered) {
            try {
                const items = await OrderItem.findAll({ where: { order_id: order.id } });
                for (const item of items) {
                    if (item.variant_id) {
                        await ProductVariantPrice.decrement(
                            { stock: item.quantity, reserved_stock: item.quantity },
                            { where: { variant_id: item.variant_id } }
                        );
                    } else if (item.product_id) {
                        await Product.decrement(
                            { stock: item.quantity, reserved_stock: item.quantity },
                            { where: { id: item.product_id } }
                        );
                    }
                }
            } catch (stockErr) {
                console.error("STOCK CONSUMPTION ERROR (delivery):", stockErr);
            }
        }


        // 4. Handle Cancellations & Returns (Escrow protection & Customer Refund)
        if ((mappedStatus === 'annulée' || mappedStatus === 'retournée') && (oldStatus !== 'annulée' && oldStatus !== 'retournée')) {
            // WhatsApp notification and unassignment of deliverer
            if (order.delivery_person_id) {
                try {
                    const deliverer = await DeliveryPerson.findByPk(order.delivery_person_id, { include: [{ model: Profile, as: 'profile' }] });
                    const driverPhone = deliverer?.phone || deliverer?.profile?.phone;
                    if (driverPhone) {
                        notifyDelivererOfOrderStatusUpdate(driverPhone, order.id, mappedStatus).catch(() => {});
                    }
                } catch (e) {
                    console.error("DELIVERER CANCELLATION NOTIFICATION ERROR:", e);
                }
                
                try {
                    await order.update({ delivery_person_id: null, assigned_at: null });
                } catch (e) {
                    console.error("DELIVERER UNASSIGNMENT ERROR:", e);
                }
            }

            // Stock : deux cas bien distincts selon que la livraison avait déjà
            // consommé le stock réel ou non.
            if (oldStatus === 'livrée') {
                // La livraison avait déjà décrémenté stock ET reserved_stock (voir
                // plus haut) — un retour restaure donc le vrai stock physique.
                try {
                    const items = await OrderItem.findAll({ where: { order_id: order.id } });
                    for (const item of items) {
                        if (item.variant_id) {
                            await ProductVariantPrice.increment('stock', { by: item.quantity, where: { variant_id: item.variant_id } });
                        } else {
                            await Product.increment('stock', { by: item.quantity, where: { id: item.product_id } });
                        }
                    }
                } catch (stockErr) {
                    console.error("STOCK RESTORE ERROR:", stockErr);
                }
            } else if (['confirmée', 'expédiée'].includes(oldStatus)) {
                // Jamais livrée : le stock réel n'a jamais été touché, seule la
                // réservation doit être relâchée.
                try {
                    const items = await OrderItem.findAll({ where: { order_id: order.id } });
                    for (const item of items) {
                        if (item.variant_id) {
                            await ProductVariantPrice.decrement('reserved_stock', { by: item.quantity, where: { variant_id: item.variant_id } });
                        } else {
                            await Product.decrement('reserved_stock', { by: item.quantity, where: { id: item.product_id } });
                        }
                    }
                } catch (stockErr) {
                    console.error("RESERVED STOCK RELEASE ERROR:", stockErr);
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
                    // Guard against duplicate refunds (idempotency)
                    const existingRefund = await FinancialTransaction.findOne({
                        where: { order_id: order.id, user_id: order.user_id, type: 'earning', description: { [Op.like]: 'Remboursement%' } }
                    });

                    if (!existingRefund) {
                        // For split orders the payout is stored on the parent order — search both
                        const searchIds = [order.id];
                        if (order.parent_id && order.parent_id !== order.id) searchIds.push(order.parent_id);

                        const debitTx = await FinancialTransaction.findOne({
                            where: { order_id: { [Op.in]: searchIds }, user_id: order.user_id, type: 'payout', status: 'completed' }
                        });

                        if (debitTx) {
                            // Refund exactly this sub-order's total (not the full grand-total for split orders)
                            const refundAmount = parseFloat(order.total_amount);

                            await FinancialTransaction.create({
                                id: crypto.randomUUID(),
                                user_id: order.user_id,
                                order_id: order.id,
                                type: 'earning',
                                amount: refundAmount,
                                description: `Remboursement commande #${order.id.slice(0, 8)}`,
                                status: 'completed'
                            });

                            await Notification.create({
                                id: crypto.randomUUID(),
                                user_id: order.user_id,
                                title: '💰 Remboursement effectué',
                                message: `Votre portefeuille a été recrédité de ${refundAmount.toLocaleString('fr-FR')} F CFA suite à l'annulation de votre commande.`,
                                type: 'wallet'
                            });
                        } else {
                            console.warn(`[WALLET REFUND] No payout tx found for order ${order.id} (searched: ${searchIds.join(', ')})`);
                        }
                    }
                } catch (refundErr) {
                    console.error("CUSTOMER REFUND ERROR:", refundErr);
                }
            }
        }


        // 4. Email notification
        try {
            const userProfile = await Profile.findByPk(order.user_id);
            const notifEmail = userProfile?.email || order.guest_email;
            if (notifEmail) {
                const orderWithEmail = { ...order.toJSON(), user_email: notifEmail };
                await sendOrderUpdateToCustomer(orderWithEmail, mappedStatus);
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

export const triggerStuckOrdersCheck = async (req, res) => {
    try {
        const { checkAndRemindStuckOrders } = await import('../services/notificationService.js');
        const count = await checkAndRemindStuckOrders(2); // 2 hours
        res.json({ message: 'Vérification terminée', notified_count: count });
    } catch (error) {
        console.error("TRIGGER STUCK CHECK ERROR:", error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const reportOrderDispute = async (req, res) => {
    try {
        const { id } = req.params;
        const { motif, description, photo_url } = req.body;
        const userId = req.auth?.userId;

        // Empêcher les doublons: un seul litige actif par commande
        const existingDispute = await Dispute.findOne({
            where: { order_id: id, status: { [Op.notIn]: ['cancelled'] } }
        });
        if (existingDispute) {
            return res.status(409).json({
                error: 'Un litige est déjà en cours pour cette commande.',
                dispute_id: existingDispute.id
            });
        }

        const order = await Order.findByPk(id);
        if (!order) return res.status(404).json({ error: 'Commande non trouvée' });
        if (order.user_id !== userId) return res.status(403).json({ error: 'Accès non autorisé' });

        const normalizedStatus = (order.status || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
        if (!normalizedStatus.startsWith('livr')) {
            return res.status(400).json({ error: 'Vous ne pouvez signaler un problème que sur une commande déjà livrée.' });
        }

        const reason = motif || 'Problème signalé par le client';

        const dispute = await Dispute.create({
            id: crypto.randomUUID(),
            order_id: id,
            user_id: userId,
            supplier_id: order.supplier_id,
            motif: motif || null,
            reason,
            description: description || null,
            photo_url: photo_url || null,
            status: 'open'
        });

        await order.update({ dispute_status: 'ouvert' });

        // Notification in-app au client
        Notification.create({
            id: crypto.randomUUID(),
            user_id: userId,
            title: '⚠️ Litige enregistré',
            message: `Votre signalement pour la commande #${id.slice(0, 8)} a bien été reçu. Notre équipe vous contactera sous 48h.`,
            type: 'info',
            is_read: false,
        }).catch(err => console.error('[Notif dispute client]', err.message));

        // Notification in-app + WhatsApp au fournisseur
        if (order.supplier_id) {
            Supplier.findByPk(order.supplier_id, {
                include: [{ model: Boutique, as: 'boutique' }]
            }).then(supplier => {
                if (!supplier) return;
                const supplierMsg = `⚠️ *LITIGE OUVERT* sur votre commande #${id.slice(0, 8)}\nMotif : ${reason}${description ? `\nDétail : "${description}"` : ''}\n\nConnectez-vous au portail Vtout pour consulter le dossier.`;
                // In-app notification to supplier user
                if (supplier.user_id) {
                    Notification.create({
                        id: crypto.randomUUID(),
                        user_id: supplier.user_id,
                        title: '⚠️ Litige signalé sur votre commande',
                        message: `Un client a signalé un problème sur la commande #${id.slice(0, 8)} — Motif : ${reason}`,
                        type: 'warning',
                        is_read: false,
                    }).catch(err => console.error('[Notif dispute supplier]', err.message));
                }
                // WhatsApp to supplier
                const supplierPhone = supplier.whatsapp || supplier.phone || supplier.boutique?.whatsapp;
                if (supplierPhone) {
                    sendWhatsAppMessage(supplierPhone, supplierMsg)
                        .catch(err => console.error('[WhatsApp dispute supplier]', err.message));
                }
            }).catch(err => console.error('[Supplier lookup dispute]', err.message));
        }

        notifyAdmin(`⚠️ LITIGE OUVERT : Commande #${id.slice(0, 8)} — Motif: ${reason}${description ? ` — "${description}"` : ''}`)
            .catch(err => console.error('[WhatsApp dispute admin]', err.message));

        res.status(201).json({ message: 'Litige enregistré avec succès', dispute });
    } catch (error) {
        console.error("REPORT DISPUTE ERROR:", error);
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
                include: [{ model: Profile, as: 'user', attributes: ['fullname', 'phone'] }]
            }]
        });

        // Unique suppliers
        const suppliersMap = new Map();
        supplierProducts.forEach(sp => {
            if (sp.supplier && !suppliersMap.has(sp.supplier.id)) {
                suppliersMap.set(sp.supplier.id, {
                    id: sp.supplier.id,
                    name: sp.supplier.name,
                    phone: sp.supplier.user?.phone || sp.supplier.phone,
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
export const respondToDisputeResolution = async (req, res) => {
    try {
        const { id } = req.params;
        const { response } = req.body; // 'confirm' | 'contest'
        const userId = req.auth?.userId;

        const order = await Order.findByPk(id);
        if (!order) return res.status(404).json({ error: 'Commande non trouvée' });
        if (order.user_id !== userId) return res.status(403).json({ error: 'Accès non autorisé' });

        const dispute = await Dispute.findOne({ where: { order_id: id, user_id: userId } });
        if (!dispute) return res.status(404).json({ error: 'Aucun litige trouvé' });

        // Vérifier que la résolution est bien en attente de réponse
        if (dispute.status !== 'resolved') {
            return res.status(400).json({ error: 'Ce litige n\'est pas en attente de confirmation.' });
        }

        // Délai de contestation : 7 jours après la résolution admin
        if (response === 'contest' && dispute.resolved_at) {
            const deadlineMs = 7 * 24 * 60 * 60 * 1000;
            if (Date.now() - new Date(dispute.resolved_at).getTime() > deadlineMs) {
                return res.status(403).json({ error: 'Le délai de contestation de 7 jours est dépassé. La résolution est définitive.' });
            }
        }

        if (response === 'confirm') {
            await dispute.update({ status: 'resolved' });
            await order.update({ dispute_status: 'resolu' });
            notifyAdmin(`✅ Litige #${dispute.id.slice(0, 8)} confirmé résolu par le client.`)
                .catch(err => console.error('[WhatsApp confirm dispute]', err.message));
        } else if (response === 'contest') {
            await dispute.update({ status: 'open', resolved_at: null });
            await order.update({ dispute_status: 'ouvert' });
            notifyAdmin(`⚠️ Litige #${dispute.id.slice(0, 8)} contesté par le client — réouverture du dossier.`)
                .catch(err => console.error('[WhatsApp contest dispute]', err.message));
            Notification.create({
                id: crypto.randomUUID(),
                user_id: userId,
                title: '🔄 Litige réouvert',
                message: `Votre contestation pour la commande #${id.slice(0, 8)} a été enregistrée. Notre équipe va réexaminer le dossier.`,
                type: 'info',
                is_read: false,
            }).catch(err => console.error('[Notif contest]', err.message));
        } else {
            return res.status(400).json({ error: 'Réponse invalide' });
        }

        res.json({ message: response === 'confirm' ? 'Résolution confirmée' : 'Contestation enregistrée' });
    } catch (error) {
        console.error("DISPUTE RESPONSE ERROR:", error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const addDisputeEvidence = async (req, res) => {
    try {
        const { id } = req.params;
        const { photo_url } = req.body;
        const userId = req.auth?.userId;

        const order = await Order.findByPk(id);
        if (!order) return res.status(404).json({ error: 'Commande non trouvée' });
        if (order.user_id !== userId) return res.status(403).json({ error: 'Accès non autorisé' });

        const dispute = await Dispute.findOne({
            where: { order_id: id, status: { [Op.in]: ['open', 'under_review'] } }
        });
        if (!dispute) return res.status(404).json({ error: 'Aucun litige actif trouvé' });

        const newHistory = [...(dispute.status_history || []), {
            status: 'evidence_added', date: new Date(), actor: 'client'
        }];
        await dispute.update({ photo_url, status_history: newHistory });

        notifyAdmin(`📎 Nouvelle preuve ajoutée pour litige #${dispute.id.slice(0, 8)} (Commande #${id.slice(0, 8)})`).catch(err => console.error('[WA evidence]', err.message));

        res.json({ message: 'Preuve ajoutée avec succès', dispute });
    } catch (error) {
        console.error("ADD EVIDENCE ERROR:", error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
