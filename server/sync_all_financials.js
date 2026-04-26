import { Order, FinancialTransaction, DeliveryPerson, sequelize } from './models/index.js';
import { processOrderFinancials } from './services/financialService.js';

async function syncAll() {
    try {
        console.log("🚀 Starting Global Financial & Status Sync...");
        
        // 1. Normalize Statuses
        const replacements = [
            { from: 'confirmee', to: 'confirmée' },
            { from: 'expediee', to: 'expédiée' },
            { from: 'livree', to: 'livrée' },
            { from: 'annulee', to: 'annulée' },
            { from: 'assignee', to: 'assignée' }
        ];

        for (const r of replacements) {
            const [results] = await sequelize.query(
                'UPDATE orders SET status = :to WHERE status = :from',
                {
                    replacements: { from: r.from, to: r.to },
                    type: sequelize.QueryTypes.UPDATE
                }
            );
            console.log(`✅ Updated orders from "${r.from}" to "${r.to}"`);
        }

        // 2. Ensure all existing earning transactions are 'completed'
        console.log("\n✅ Ensuring all earning transactions are marked as 'completed'...");
        await FinancialTransaction.update(
            { status: 'completed' },
            { where: { type: 'earning', status: ['pending', null] } }
        );

        // 2. Fix Missing Delivery Fees & Create Transactions
        console.log("\n🔍 Checking for delivered orders without earnings...");
        const orders = await Order.findAll({ 
            where: { status: 'livrée' } 
        });
        
        console.log(`Found ${orders.length} total delivered orders.`);
        
        for (const order of orders) {
            let updated = false;
            // Ensure delivery fee is at least 1000 if it was 0/null
            if (!order.delivery_fee || parseFloat(order.delivery_fee) === 0) {
                console.log(`💰 Setting missing delivery fee (1000F) for Order ${order.id}`);
                await order.update({ delivery_fee: 1000 });
                updated = true;
            }
            
            // Check if any earning transaction exists for this order
            const txCount = await FinancialTransaction.count({ 
                where: { order_id: order.id, type: 'earning' } 
            });
            
            if (txCount === 0) {
                console.log(`💸 Generating missing transactions for Order ${order.id}...`);
                await processOrderFinancials(order);
            }
        }

        console.log("\n✨ Sync complete! The wallets should now be up to date.");
        process.exit(0);
    } catch (error) {
        console.error("\n❌ Sync failed:", error);
        process.exit(1);
    }
}

syncAll();
