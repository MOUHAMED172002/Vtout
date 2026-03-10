const { sequelize } = require('./models');

async function cleanAllIndexes() {
    try {
        console.log("Connecting to database...");
        await sequelize.authenticate();

        const tables = ['profiles']; // We can add more if needed

        for (const tableName of tables) {
            console.log(`Cleaning indexes for '${tableName}' table...`);
            const [results] = await sequelize.query(`SHOW INDEX FROM \`${tableName}\``);

            const indexNames = [...new Set(results.map(r => r.Key_name))];
            console.log(`Found ${indexNames.length} unique index names.`);

            for (const name of indexNames) {
                if (name === 'PRIMARY') continue;

                try {
                    console.log(`Dropping index: ${name}`);
                    await sequelize.query(`ALTER TABLE \`${tableName}\` DROP INDEX \`${name}\``);
                } catch (e) {
                    console.log(`  Failed to drop ${name}: ${e.message}`);
                }
            }
        }

        console.log("Cleanup complete.");

    } catch (error) {
        console.error("Maintenance task failed:", error);
    } finally {
        await sequelize.close();
    }
}

cleanAllIndexes();
