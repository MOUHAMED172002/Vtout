const { sequelize } = require('./models');

async function debugSync() {
    try {
        console.log("Starting debug sync with logging...");
        await sequelize.authenticate();
        console.log("Database connected.");

        // Use alter: true and logging to see what's happening
        await sequelize.sync({
            alter: true,
            logging: (sql) => {
                console.log(`[SQL EXEC] ${sql.substring(0, 200)}${sql.length > 200 ? '...' : ''}`);
            }
        });

        console.log("Sync completed successfully!");

    } catch (error) {
        console.error("Sync failed:", error);
    } finally {
        await sequelize.close();
    }
}

debugSync();
