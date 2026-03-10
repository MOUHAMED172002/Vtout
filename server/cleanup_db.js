const { sequelize } = require('./models');

async function cleanup() {
    try {
        console.log("Connecting to database...");
        await sequelize.authenticate();

        console.log("1. Cleaning up redundant indexes in 'profiles' table...");
        const [results] = await sequelize.query("SHOW INDEX FROM profiles");
        const indexNames = [...new Set(results.map(r => r.Key_name))];

        // Keep PRIMARY, email, username, phone, clerk_id
        const keepList = ['PRIMARY', 'email', 'username', 'phone', 'clerk_id'];

        for (const name of indexNames) {
            if (!keepList.includes(name) && (name.includes('_') || /\d+$/.test(name))) {
                try {
                    console.log(`Dropping index: ${name}`);
                    await sequelize.query(`ALTER TABLE \`profiles\` DROP INDEX \`${name}\``);
                } catch (e) {
                    console.log(`  Failed to drop ${name}: ${e.message}`);
                }
            }
        }

        console.log("\n2. Fixing 'addresses.user_id' nullability...");
        // First drop the problematic foreign key if it exists partially
        try {
            // We don't know the exact name Sequelize gave it, but it's likely addresses_user_id_foreign_idx or similar
            // Actually, let's just make the column nullable first.
            console.log("Modifying user_id column to be NULLable...");
            await sequelize.query("ALTER TABLE `addresses` MODIFY `user_id` CHAR(36) NULL");
        } catch (e) {
            console.log(`  Failed to modify column: ${e.message}`);
        }

        console.log("\n3. Attempting to drop existing foreign keys on 'addresses' to clear state...");
        try {
            // Query for FK names accurately
            const [fkResults] = await sequelize.query(`
                SELECT CONSTRAINT_NAME 
                FROM information_schema.KEY_COLUMN_USAGE 
                WHERE TABLE_NAME = 'addresses' 
                AND TABLE_SCHEMA = DATABASE() 
                AND REFERENCED_TABLE_NAME = 'profiles'
            `);

            for (const fk of fkResults) {
                console.log(`Dropping existing FK: ${fk.CONSTRAINT_NAME}`);
                await sequelize.query(`ALTER TABLE \`addresses\` DROP FOREIGN KEY \`${fk.CONSTRAINT_NAME}\``);
            }
        } catch (e) {
            console.log(`  Failed to drop FKs: ${e.message}`);
        }

        console.log("\nCleanup complete.");
    } catch (error) {
        console.error("Cleanup failed:", error);
    } finally {
        await sequelize.close();
    }
}

cleanup();
