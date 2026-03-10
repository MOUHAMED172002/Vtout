const { sequelize } = require('./models');

async function fixDeliverySchema() {
    try {
        console.log("Checking delivery_persons table columns...");
        const [columns] = await sequelize.query("DESCRIBE delivery_persons");
        const columnNames = columns.map(c => c.Field);

        if (!columnNames.includes('service_zones')) {
            console.log("Adding service_zones column...");
            await sequelize.query("ALTER TABLE delivery_persons ADD COLUMN service_zones JSON");
            console.log("service_zones column added successfully.");
        } else {
            console.log("service_zones column already exists.");
        }

    } catch (error) {
        console.error("Error fixing delivery schema:", error);
    }
    process.exit();
}

fixDeliverySchema();
