import { FinancialTransaction, Order, DeliveryPerson, sequelize } from './server/models/index.js';
import fs from 'fs';

async function debug() {
    let output = "--- DEBUG FINANCIALS ---\n";
    try {
        const txsCount = await FinancialTransaction.count();
        output += `Total Transactions in DB: ${txsCount}\n`;

        const lastTxs = await FinancialTransaction.findAll({ limit: 5, order: [['createdAt', 'DESC']] });
        output += `Last 5 Transactions: ${JSON.stringify(lastTxs, null, 2)}\n`;

        const deliveredOrders = await Order.findAll({ where: { status: ['livree', 'livrée'] } });
        output += `Delivered Orders Count: ${deliveredOrders.length}\n`;
        
        for (const o of deliveredOrders) {
            output += `Order ${o.id}: Status=${o.status}, Fee=${o.delivery_fee}, Livreur=${o.delivery_person_id}\n`;
        }

        const livreurs = await DeliveryPerson.findAll();
        for (const lp of livreurs) {
            output += `Livreur ${lp.id}: UserID=${lp.user_id}, TotalDeliveries=${lp.total_deliveries}\n`;
            const lpTxs = await FinancialTransaction.findAll({ where: { user_id: lp.user_id } });
            output += `  -> Transactions for this user: ${lpTxs.length}\n`;
        }

    } catch (err) {
        output += `ERROR: ${err.message}\n`;
    }
    
    fs.writeFileSync('server/debug_fin_output.txt', output);
    process.exit();
}

debug();
