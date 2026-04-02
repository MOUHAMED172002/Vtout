const { sequelize, Order, DeliveryPerson } = require('./models');

async function syncNewColumns() {
    try {
        console.log('Starting sync for new columns...');
        
        // Use alter: true to add new columns to existing tables without data loss
        await sequelize.query('ALTER TABLE `delivery_persons` ADD COLUMN IF NOT EXISTS `lat` DECIMAL(10, 8) NULL;');
        await sequelize.query('ALTER TABLE `delivery_persons` ADD COLUMN IF NOT EXISTS `lng` DECIMAL(11, 8) NULL;');
        await sequelize.query('ALTER TABLE `delivery_persons` ADD COLUMN IF NOT EXISTS `last_location_update` DATETIME NULL;');
        
        await sequelize.query('ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `delivery_fee` DECIMAL(10, 2) DEFAULT 0.00;');
        await sequelize.query('ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `distance` DECIMAL(10, 2) NULL;');
        
        console.log('Database columns updated successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error syncing columns:', error);
        process.exit(1);
    }
}

syncNewColumns();
