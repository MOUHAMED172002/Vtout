const sequelize = require('./config/database');

async function fixOrdersSchema() {
    try {
        console.log("Connecting to database...");
        await sequelize.authenticate();

        console.log("Adding 'invoice_sent' column to 'orders' table...");
        await sequelize.query("ALTER TABLE orders ADD COLUMN invoice_sent BOOLEAN DEFAULT FALSE AFTER proof_url;");
        console.log("Column 'invoice_sent' added successfully.");

    } catch (error) {
        if (error.original && error.original.errno === 1060) {
            console.log("Column 'invoice_sent' already exists.");
        } else {
            console.error("Failed to fix schema:", error);
        }
    } finally {
        await sequelize.close();
    }
}

fixOrdersSchema();
