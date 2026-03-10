const { Order } = require('./models');
const sequelize = require('./config/database');

async function checkOrdersSchema() {
    try {
        console.log("Connecting to database...");
        await sequelize.authenticate();

        const tableName = 'orders';
        console.log(`\n--- Schema for '${tableName}' ---`);

        // Check columns
        const [columns] = await sequelize.query(`SHOW FULL COLUMNS FROM ${tableName}`);
        columns.forEach(col => {
            console.log(`${col.Field}: ${col.Type} | Null: ${col.Null} | Key: ${col.Key}`);
        });

        // Check one entry if exists
        const order = await Order.findOne();
        if (order) {
            console.log("\n--- Sample Order ---");
            console.log(JSON.stringify(order.toJSON(), null, 2));
        } else {
            console.log("\nNo orders found.");
        }

    } catch (error) {
        console.error("Diagnostic failed:", error);
    } finally {
        await sequelize.close();
    }
}

checkOrdersSchema();
