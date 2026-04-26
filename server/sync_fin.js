import { Order, FinancialTransaction } from './models/index.js';
import { processOrderFinancials } from './services/financialService.js';

async function run() {
    try {
        console.log('Searching for delivered orders without transactions...');
        const orders = await Order.findAll({ 
            where: { 
                status: ['livree', 'livrée'] 
            } 
        });
        
        console.log(`Found ${orders.length} delivered orders.`);
        
        for (const order of orders) {
            const txCount = await FinancialTransaction.count({ where: { order_id: order.id } });
            if (txCount === 0) {
                console.log(`Processing missing financials for Order: ${order.id} (Status: ${order.status}, Fee: ${order.delivery_fee})`);
                await processOrderFinancials(order);
            } else {
                console.log(`Order ${order.id} already has transactions.`);
            }
        }
        console.log('Sync complete.');
    } catch (e) {
        console.log('Sync Error:', e.message);
    }
    process.exit();
}
run();
