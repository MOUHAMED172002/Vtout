import dotenv from 'dotenv';
dotenv.config();

import { Profile, Supplier, FinancialTransaction, Order, sequelize } from './models/index.js';
import { Op } from 'sequelize';
import { processOrderFinancials } from './services/financialService.js';

async function run() {
    console.log("=== DIAGNOSTIC START ===");
    try {
        await sequelize.authenticate();
        console.log("Database connection successful!");
        
        // 1. Check tables user and profile
        console.log("\n--- Checking User & Profile schemas and data ---");
        const profilesCount = await Profile.count();
        console.log(`Total profiles in DB: ${profilesCount}`);
        
        // Check if role field values in profiles
        const roles = await Profile.findAll({
            attributes: ['role', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
            group: ['role'],
            raw: true
        });
        console.log("Roles distribution in profiles:", roles);

        // Check user table role values
        try {
            const users = await sequelize.query("SELECT role, COUNT(id) as count FROM user GROUP BY role", {
                type: sequelize.QueryTypes.SELECT
            });
            console.log("Roles distribution in user table:", users);
        } catch (err) {
            console.error("Could not query user table roles:", err.message);
        }

        // 2. Check a Supplier status update
        console.log("\n--- Checking Supplier Approval & Role Sync ---");
        const oneSupplier = await Supplier.findOne({
            include: [{ model: Profile, as: 'user' }]
        });
        if (oneSupplier) {
            console.log(`Found supplier ID: ${oneSupplier.id}, Name: ${oneSupplier.name}, User ID: ${oneSupplier.user_id}, Status: ${oneSupplier.status}`);
            if (oneSupplier.user) {
                console.log(`Associated Profile email: ${oneSupplier.user.email}, Role: ${oneSupplier.user.role}`);
            } else {
                console.log("WARNING: Supplier has no associated user profile!");
            }
        } else {
            console.log("No suppliers found in DB.");
        }

        // 3. Test Dashboard gains query
        console.log("\n--- Testing Dashboard query ---");
        const since = new Date();
        since.setDate(since.getDate() - 30);
        const allGains = await FinancialTransaction.findAll({
            where: {
                type: 'earning',
                status: 'completed',
                createdAt: { [Op.gte]: since }
            },
            include: [{
                model: Profile,
                as: 'user',
                attributes: ['role']
            }],
            attributes: [
                [sequelize.col('user.role'), 'role'],
                [sequelize.fn('SUM', sequelize.col('amount')), 'total']
            ],
            group: [sequelize.col('user.role')],
            raw: true
        });
        console.log("Raw Gains returned by query:", allGains);

        // 4. Test order rollback logic mock
        console.log("\n--- Testing Rollback Logic ---");
        const testOrder = await Order.findOne();
        if (testOrder) {
            console.log(`Found test order: ${testOrder.id}, Status: ${testOrder.status}`);
        } else {
            console.log("No orders found in DB.");
        }
        
    } catch (error) {
        console.error("DIAGNOSTIC CRITICAL FAILURE:", error);
    } finally {
        await sequelize.close();
        console.log("\n=== DIAGNOSTIC END ===");
    }
}

run();
