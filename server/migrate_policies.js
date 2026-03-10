const sequelize = require('./config/database');
const { Policy } = require('./models');

async function migrate() {
    try {
        console.log("Starting migration for policies table...");
        const queryInterface = sequelize.getQueryInterface();
        const tableDefinition = await queryInterface.describeTable('policies');

        if (!tableDefinition.type) {
            console.log("Adding 'type' column to policies table...");
            await queryInterface.addColumn('policies', 'type', {
                type: require('sequelize').DataTypes.ENUM('general', 'supplier', 'delivery'),
                defaultValue: 'general'
            });
            console.log("Column added successfully.");
        } else {
            console.log("Column 'type' already exists.");
        }
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        process.exit();
    }
}

migrate();
