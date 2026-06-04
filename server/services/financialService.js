import crypto from 'crypto';
import { Op } from 'sequelize';
import { FinancialTransaction, Config, OrderItem, Product, Supplier, DeliveryPerson, Profile, Notification, Order, Category } from '../models/index.js';
import sequelize from '../config/database.js';
import { getDeliveryFeeTiers, computeDeliveryFee, decomposePublicPrice, getDeliveryMultiplierTiers, computeDeliveryMultiplier } from './deliveryFeeService.js';

export const processOrderFinancials = async (orderIdOrObject) => {
    const t = await sequelize.transaction();
    try {
        // Fetch order with lock to prevent race conditions
        const orderId = typeof orderIdOrObject === 'string' ? orderIdOrObject : orderIdOrObject.id;
        const order = await Order.findByPk(orderId, { 
            transaction: t,
            lock: true
        });

        if (!order) {
            console.error(`[Finance] Order ${orderId} not found`);
            await t.rollback();
            return;
        }

        // DOUBLE SECURITY: Only process if status is 'livrée'
        if (order.status !== 'livrée' && order.status !== 'livree') {
            console.warn(`[Finance] Order ${orderId} is NOT delivered (${order.status}). Aborting financial processing.`);
            await t.rollback();
            return;
        }

        if (order.dispute_status) {
            console.warn(`[Finance] Order ${orderId} is under dispute (${order.dispute_status}). Financial processing on hold.`);
            await t.rollback();
            return;
        }

        console.log(`[Finance] Processing financials for order ${order.id}...`);
        
        // 1. Supplier Earning
        if (order.supplier_id) {
            const supplier = await Supplier.findByPk(order.supplier_id, { transaction: t });
            if (supplier && supplier.user_id) {
                const existingTx = await FinancialTransaction.findOne({
                    where: { 
                        order_id: order.id, 
                        user_id: supplier.user_id, 
                        type: 'earning',
                        [Op.or]: [{ source: 'supplier' }, { source: null }]
                    },
                    transaction: t
                });

                if (!existingTx) {
                    const items = await OrderItem.findAll({ 
                        where: { order_id: order.id },
                        include: [{ model: Product, as: 'product' }],
                        transaction: t
                    });
                    let subtotal = 0;
                    let adminTotal = 0;
                    let totalBaseMarketingFee = 0;
                    
                    const globalRateConfig = await Config.findOne({ where: { key: 'commission_rate' }, transaction: t });
                    const globalCommissionRate = globalRateConfig?.value ? parseFloat(globalRateConfig.value) / 100 : 0.10;
                    const deliveryTiers = await getDeliveryFeeTiers();
                    let supplierTotal = 0;
 
                    for (const item of items) {
                        const itemClientPrice = parseFloat(item.price) || 0;
                        subtotal += itemClientPrice * item.quantity;

                        let itemRate = globalCommissionRate;
                        if (item.product?.category_id) {
                            const category = await item.product.getCategory({ transaction: t });
                            if (category?.commission_rate) {
                                itemRate = parseFloat(category.commission_rate) / 100;
                            }
                        }

                        const decomposed = decomposePublicPrice(itemClientPrice, itemRate, deliveryTiers);
                        const effectiveSupplierPrice = decomposed.supplierPrice;
                        const itemMarketingFee = decomposed.deliveryFee;
                        const commissionDeducted = Math.round(effectiveSupplierPrice * itemRate);

                        totalBaseMarketingFee += itemMarketingFee * item.quantity;
                        adminTotal += commissionDeducted * item.quantity;
                        supplierTotal += Math.round((effectiveSupplierPrice - commissionDeducted) * item.quantity);
                    }

                    const geographicalFee = parseFloat(order.delivery_fee || 0);

                    if (supplierTotal > 0) {
                        await FinancialTransaction.create({
                            id: crypto.randomUUID(),
                            user_id: supplier.user_id,
                            order_id: order.id,
                            type: 'earning',
                            source: 'supplier',
                            amount: supplierTotal,
                            description: `Vente (Boutique) #${order.id.slice(0, 8)}`,
                            status: 'completed'
                        }, { transaction: t });
                        
                        await Notification.create({
                            id: crypto.randomUUID(),
                            user_id: supplier.user_id,
                            title: '💰 Nouveaux gains !',
                            message: `Vous avez reçu ${supplierTotal.toFixed(0)} F CFA pour la commande #${order.id.slice(0, 8)}.`,
                            type: 'wallet'
                        }, { transaction: t });
                    }

                    // Admin Commission
                    if (adminTotal > 0) {
                        // Find admin by ADMIN_EMAILS env (the admin's profile role may not be 'admin'
                        // if they are also registered as a supplier/fournisseur)
                        const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
                        let admin = await Profile.findOne({ where: { role: 'admin' }, transaction: t });
                        if (!admin && adminEmails.length > 0) {
                            const { Op } = await import('sequelize');
                            admin = await Profile.findOne({
                                where: { email: { [Op.in]: adminEmails } },
                                transaction: t
                            });
                        }
                        if (admin) {
                            await FinancialTransaction.create({
                                id: crypto.randomUUID(),
                                user_id: admin.id,
                                order_id: order.id,
                                type: 'earning',
                                source: 'admin_commission',
                                amount: adminTotal,
                                description: `Com. Vente (Admin) #${order.id.slice(0, 8)}`,
                                status: 'completed'
                            }, { transaction: t });
                        }
                    }
                }
            }
        }

        // 2. Livreur Earning
        if (order.delivery_person_id) {
            console.log(`[Finance] Livreur section: delivery_person_id=${order.delivery_person_id}`);
            const lp = await DeliveryPerson.findByPk(order.delivery_person_id, { transaction: t });
            if (lp && lp.user_id) {
                console.log(`[Finance] Livreur found: lp.id=${lp.id}, lp.user_id=${lp.user_id}`);
                // IMPORTANT: Filter by source='deliverer' to avoid collision with supplier/admin earnings
                const existingLpTx = await FinancialTransaction.findOne({
                    where: { 
                        order_id: order.id, 
                        user_id: lp.user_id, 
                        type: 'earning',
                        [Op.or]: [{ source: 'deliverer' }, { source: null }]
                    },
                    transaction: t
                });

                if (!existingLpTx) {
                    const deliveryTiers = await getDeliveryFeeTiers();
                    const multiplierTiers = await getDeliveryMultiplierTiers();
                    const items = await OrderItem.findAll({
                        where: { order_id: order.id },
                        include: [{ model: Product, as: 'product' }],
                        transaction: t
                    });

                    // Total embedded delivery fees (all items × their individual fee)
                    let totalEmbeddedFees = 0;
                    let totalQuantity = 0;
                    let baseFeePerItem = 0; // fee for a single representative item
                    for (const item of items) {
                        const itemSupplierPrice = item.product?.supplier_price || 0;
                        const itemFee = computeDeliveryFee(itemSupplierPrice, deliveryTiers);
                        totalEmbeddedFees += itemFee * item.quantity;
                        totalQuantity += item.quantity;
                        if (baseFeePerItem === 0) baseFeePerItem = itemFee; // use first item as base
                    }

                    // Apply multiplier: deliverer gets base_fee × multiplier(total_qty)
                    const multiplier = computeDeliveryMultiplier(totalQuantity, multiplierTiers);
                    const delivererActualFee = Math.round(baseFeePerItem * multiplier);
                    const geographicalFee = parseFloat(order.delivery_fee || 0);
                    const totalDelivererFee = delivererActualFee + geographicalFee;

                    // Surplus goes to marketing
                    const marketingSurplus = Math.max(0, totalEmbeddedFees - delivererActualFee);

                    console.log(`[Finance] Livreur fee calc: embedded=${totalEmbeddedFees}, qty=${totalQuantity}, multiplier=${multiplier}, delivererFee=${delivererActualFee}, geo=${geographicalFee}, total=${totalDelivererFee}, surplus=${marketingSurplus}`);
                    if (totalDelivererFee > 0) {
                        await FinancialTransaction.create({
                            id: crypto.randomUUID(),
                            user_id: lp.user_id,
                            order_id: order.id,
                            type: 'earning',
                            source: 'deliverer',
                            amount: totalDelivererFee,
                            description: `Course (Livreur) #${order.id.slice(0, 8)}`,
                            status: 'completed'
                        }, { transaction: t });

                        await Notification.create({
                            id: crypto.randomUUID(),
                            user_id: lp.user_id,
                            title: '🚚 Course payée !',
                            message: `Votre compte a été crédité de ${totalDelivererFee.toFixed(0)} F CFA pour la livraison #${order.id.slice(0, 8)}.`,
                            type: 'wallet'
                        }, { transaction: t });
                    }

                    // Marketing surplus transaction
                    if (marketingSurplus > 0) {
                        const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
                        let admin = await Profile.findOne({ where: { role: 'admin' }, transaction: t });
                        if (!admin && adminEmails.length > 0) {
                            admin = await Profile.findOne({ where: { email: { [Op.in]: adminEmails } }, transaction: t });
                        }
                        if (admin) {
                            const existingMktTx = await FinancialTransaction.findOne({
                                where: { order_id: order.id, source: 'marketing' },
                                transaction: t
                            });
                            if (!existingMktTx) {
                                await FinancialTransaction.create({
                                    id: crypto.randomUUID(),
                                    user_id: admin.id,
                                    order_id: order.id,
                                    type: 'earning',
                                    source: 'marketing',
                                    amount: marketingSurplus,
                                    description: `Frais Marketing #${order.id.slice(0, 8)} (${totalQuantity} articles × coef. ${multiplier})`,
                                    status: 'completed'
                                }, { transaction: t });
                            }
                        }
                    }
                }
            }
        }

        await t.commit();
        console.log(`[Finance] Financials successfully committed for order ${order.id}`);
    } catch (error) {
        await t.rollback();
        console.error(`[Finance] ERROR processing order ${orderIdOrObject?.id || orderIdOrObject}:`, error);
        throw error;
    }
};

