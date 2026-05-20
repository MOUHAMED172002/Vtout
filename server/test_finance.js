import { sequelize, Order, FinancialTransaction, Supplier, DeliveryPerson } from './models/index.js';
import { processOrderFinancials } from './services/financialService.js';

async function run() {
    try {
        console.log("Checking orders...");
        const orders = await Order.findAll({
            where: { status: 'livrée' },
            limit: 5,
            order: [['updated_at', 'DESC']]
        });
        
        console.log(`Found ${orders.length} delivered orders.`);
        for (const order of orders) {
            console.log(`\nOrder ID: ${order.id}, Supplier: ${order.supplier_id}, DeliveryPerson: ${order.delivery_person_id}`);
            const txs = await FinancialTransaction.findAll({ where: { order_id: order.id } });
            console.log(`Transactions found for this order: ${txs.length}`);
            if (txs.length === 0) {
                console.log(`Attempting to run processOrderFinancials manually for order ${order.id}...`);
                try {
                    await processOrderFinancials(order.id);
                    console.log(`Successfully ran processOrderFinancials for ${order.id}`);
                } catch(e) {
                    console.log(`ERROR running processOrderFinancials:`, e.message);
                    console.error(e);
                }
            } else {
                for (const t of txs) {
                     console.log(` - TX: ${t.type}, amount: ${t.amount}, user: ${t.user_id}`);
                }
            }
        }
    } catch(e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
run();
