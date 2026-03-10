const sequelize = require('./config/database');

async function checkOrderItemsSchema() {
    try {
        console.log("Connecting to database...");
        await sequelize.authenticate();

        const tableName = 'order_items';
        console.log(`\n--- Schema for '${tableName}' ---`);

        // Check columns
        const [columns] = await sequelize.query(`SHOW FULL COLUMNS FROM ${tableName}`);
        columns.forEach(col => {
            console.log(`${col.Field}: ${col.Type}`);
        });

    } catch (error) {
        console.error("Diagnostic failed:", error);
    } finally {
        await sequelize.close();
    }
}

checkOrderItemsSchema();
