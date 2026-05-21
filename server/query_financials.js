import 'dotenv/config';
import sequelize from './config/database.js';
import { FinancialTransaction } from './models/index.js';

async function run() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');
        const txs = await FinancialTransaction.findAll({
            limit: 20,
            order: [['createdAt', 'DESC']],
            raw: true
        });
        console.log('Recent 20 FinancialTransactions:');
        txs.forEach(t => {
            console.log(`ID: ${t.id}, UserID: ${t.user_id}, Type: ${t.type}, Amount: ${t.amount}, Status: ${t.status}, Desc: "${t.description}", OrderID: ${t.order_id}`);
        });
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await sequelize.close();
    }
}
run();
