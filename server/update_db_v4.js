const { sequelize } = require('./models');

async function syncNewColumnsV4() {
    try {
        console.log('Starting sync for delivery_code...');
        await sequelize.query('ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `delivery_code` VARCHAR(20) NULL;');
        console.log('Database columns (delivery_code) updated successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error syncing columns:', error);
        process.exit(1);
    }
}

syncNewColumnsV4();
