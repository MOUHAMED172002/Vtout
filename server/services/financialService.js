import crypto from 'crypto';
import { FinancialTransaction, Config, OrderItem, Product, Supplier, DeliveryPerson, Profile, Notification } from '../models/index.js';

export const processOrderFinancials = async (order) => {
    try {
        console.log(`[Finance] Processing financials for order ${order.id}...`);
        
        // Supplier Earning & Admin Profit
        if (order.supplier_id) {
            const supplierProfile = await Supplier.findByPk(order.supplier_id);
            if (supplierProfile) {
                const existingSupplierTx = await FinancialTransaction.findOne({
                    where: { order_id: order.id, user_id: supplierProfile.user_id, type: 'earning' }
                });

                if (!existingSupplierTx) {
                    const items = await OrderItem.findAll({ 
                        where: { order_id: order.id },
                        include: [{ model: Product, as: 'product' }]
                    });
                    
                    let supplierTotal = 0;
                    let adminTotal = 0;

                    let commissionRate = 0.10; // 10% par défaut
                    try {
                        const configRate = await Config.findOne({ where: { key: 'commission_rate' } });
                        if (configRate && configRate.value) {
                            commissionRate = parseFloat(configRate.value) / 100;
                        }
                    } catch (err) {}

                    for (const item of items) {
                        const prixVendu = parseFloat(item.price);
                        const adminProfit = prixVendu * commissionRate;
                        const exactSupplierPrice = prixVendu - adminProfit;

                        supplierTotal += exactSupplierPrice * item.quantity;
                        adminTotal += adminProfit * item.quantity;
                    }

                    if (supplierTotal > 0) {
                        await FinancialTransaction.create({
                            id: crypto.randomUUID(),
                            user_id: supplierProfile.user_id,
                            order_id: order.id,
                            type: 'earning',
                            amount: supplierTotal,
                            description: `Gains produit commande #${order.id.slice(0, 8)}`,
                            status: 'completed'
                        });
                        
                        if (Notification) {
                            await Notification.create({
                                id: crypto.randomUUID(),
                                user_id: supplierProfile.user_id,
                                title: 'Nouveaux gains !',
                                message: `Vous avez gagné ${supplierTotal.toFixed(0)} F CFA pour la commande #${order.id.slice(0, 8)}.`,
                                type: 'wallet'
                            });
                        }
                    }

                    if (adminTotal > 0) {
                        const adminProfile = await Profile.findOne({ where: { role: 'admin' } });
                        if (adminProfile) {
                            await FinancialTransaction.create({
                                id: crypto.randomUUID(),
                                user_id: adminProfile.id,
                                order_id: order.id,
                                type: 'earning',
                                amount: adminTotal,
                                description: `Commission vente #${order.id.slice(0, 8)}`,
                                status: 'completed'
                            });
                        }
                    }
                } else {
                    console.log(`[Finance] Supplier earnings already exist for order ${order.id}. Skipping supplier part.`);
                }
            }
        }

        // Livreur Earning
        console.log(`[Finance] Checking Livreur for order ${order.id}. delivery_person_id: ${order.delivery_person_id}, delivery_fee: ${order.delivery_fee}`);
        
        if (order.delivery_person_id) {
            const lp = await DeliveryPerson.findByPk(order.delivery_person_id);
            if (lp) {
                const existingLivreurTx = await FinancialTransaction.findOne({
                    where: { order_id: order.id, user_id: lp.user_id, type: 'earning' }
                });

                if (!existingLivreurTx) {
                    const fee = parseFloat(order.delivery_fee || 0);
                    console.log(`[Finance] Livreur found: ${lp.id}. Fee: ${fee}`);

                    if (fee > 0) {
                        console.log(`[Finance] Creating transaction for Livreur User: ${lp.user_id}`);
                        await FinancialTransaction.create({
                            id: crypto.randomUUID(),
                            user_id: lp.user_id,
                            order_id: order.id,
                            type: 'earning',
                            amount: fee,
                            description: `Course livraison #${order.id.slice(0, 8)}`,
                            status: 'completed'
                        });
                        
                        if (Notification) {
                            await Notification.create({
                                id: crypto.randomUUID(),
                                user_id: lp.user_id,
                                title: 'Course payée !',
                                message: `Vous avez gagné ${fee.toFixed(0)} F CFA pour la livraison #${order.id.slice(0, 8)}.`,
                                type: 'wallet'
                            });
                        }
                    } else {
                        console.log(`[Finance] Skipping Livreur transaction. Reason: Fee is 0 or less`);
                    }
                } else {
                    console.log(`[Finance] Livreur earnings already exist for order ${order.id}. skipping.`);
                }
            } else {
                console.log(`[Finance] Skipping Livreur transaction. Reason: Livreur not found`);
            }
        }
    } catch (finErr) {
        console.error("FINANCIAL LOGGING ERROR:", finErr);
    }
};
