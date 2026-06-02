import dotenv from 'dotenv';
dotenv.config();

import sequelize from './config/database.js';
import FinancialTransaction from './models/FinancialTransaction.js';
import { Op } from 'sequelize';

async function test() {
    try {
        console.log("Connecting...");
        await sequelize.authenticate();
        console.log("Connected!");

        console.log("Finding all duplicate transactions (same order_id and user_id and type='earning')...");
        
        // Let's run a raw query to find duplicates
        const duplicates = await sequelize.query(`
            SELECT order_id, user_id, COUNT(*) as count, SUM(amount) as total_amount
            FROM financial_transactions
            WHERE type = 'earning' AND order_id IS NOT NULL
            GROUP BY order_id, user_id
            HAVING count > 1
        `, { type: sequelize.QueryTypes.SELECT });

        console.log(`Found ${duplicates.length} sets of duplicates:`);
        console.log(JSON.stringify(duplicates, null, 2));

        if (duplicates.length > 0) {
            console.log("\nDetails of duplicates:");
            for (const dup of duplicates) {
                const txs = await FinancialTransaction.findAll({
                    where: {
                        order_id: dup.order_id,
                        user_id: dup.user_id,
                        type: 'earning'
                    },
                    order: [['created_at', 'ASC']]
                });
                console.log(`\nOrder #${dup.order_id.slice(0, 8)} - User #${dup.user_id.slice(0, 8)} (${txs.length} transactions):`);
                txs.forEach(t => {
                    console.log(`  - ID: ${t.id} | Amount: ${t.amount} | Source: ${t.source} | Status: ${t.status} | CreatedAt: ${t.created_at} | Description: ${t.description}`);
                });
            }
        }
    } catch (err) {
        console.error("Error during test:", err);
    } finally {
        await sequelize.close();
    }
}
test();
