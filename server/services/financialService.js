import crypto from 'crypto';
import { FinancialTransaction, Config, OrderItem, Product, Supplier, DeliveryPerson, Profile, Notification, Order } from '../models/index.js';
import sequelize from '../config/database.js';

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
                    where: { order_id: order.id, user_id: supplier.user_id, type: 'earning' },
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
                    
                    const globalRateConfig = await Config.findOne({ where: { key: 'commission_rate' }, transaction: t });
                    const globalCommissionRate = globalRateConfig?.value ? parseFloat(globalRateConfig.value) / 100 : 0.10;
 
                    for (const item of items) {
                        const itemSubtotal = parseFloat(item.price) * item.quantity;
                        subtotal += itemSubtotal;
                        
                        // Use category commission rate if available
                        let itemRate = globalCommissionRate;
                        if (item.product?.category_id) {
                            const category = await item.product.getCategory({ transaction: t });
                            if (category?.commission_rate) {
                                itemRate = parseFloat(category.commission_rate) / 100;
                            }
                        }
                        adminTotal += itemSubtotal * itemRate;
                    }
 
                    const deliveryFee = parseFloat(order.delivery_fee || 0);
                    supplierTotal = subtotal - adminTotal - deliveryFee;

                    if (supplierTotal > 0) {
                        await FinancialTransaction.create({
                            id: crypto.randomUUID(),
                            user_id: supplier.user_id,
                            order_id: order.id,
                            type: 'earning',
                            amount: supplierTotal,
                            description: `Vente #${order.id.slice(0, 8)}`,
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
                        const admin = await Profile.findOne({ where: { role: 'admin' }, transaction: t });
                        if (admin) {
                            await FinancialTransaction.create({
                                id: crypto.randomUUID(),
                                user_id: admin.id,
                                order_id: order.id,
                                type: 'earning',
                                amount: adminTotal,
                                description: `Com. Vente #${order.id.slice(0, 8)}`,
                                status: 'completed'
                            }, { transaction: t });
                        }
                    }
                }
            }
        }

        // 2. Livreur Earning
        if (order.delivery_person_id) {
            const lp = await DeliveryPerson.findByPk(order.delivery_person_id, { transaction: t });
            if (lp && lp.user_id) {
                const existingLpTx = await FinancialTransaction.findOne({
                    where: { order_id: order.id, user_id: lp.user_id, type: 'earning' },
                    transaction: t
                });

                if (!existingLpTx) {
                    const fee = parseFloat(order.delivery_fee || 0);
                    if (fee > 0) {
                        await FinancialTransaction.create({
                            id: crypto.randomUUID(),
                            user_id: lp.user_id,
                            order_id: order.id,
                            type: 'earning',
                            amount: fee,
                            description: `Course #${order.id.slice(0, 8)}`,
                            status: 'completed'
                        }, { transaction: t });

                        await Notification.create({
                            id: crypto.randomUUID(),
                            user_id: lp.user_id,
                            title: '🚚 Course payée !',
                            message: `Votre compte a été crédité de ${fee.toFixed(0)} F CFA pour la livraison #${order.id.slice(0, 8)}.`,
                            type: 'wallet'
                        }, { transaction: t });
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

