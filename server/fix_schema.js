const { sequelize } = require('./models');

async function fixSchema() {
    try {
        console.log('Adding supplier_id column to orders table...');
        await sequelize.query('ALTER TABLE orders ADD COLUMN supplier_id CHAR(36) NULL');
        console.log('Successfully added supplier_id');
    } catch (error) {
        if (error.message.includes('Duplicate column name')) {
            console.log('Column supplier_id already exists');
        } else {
            console.error('Failed to add supplier_id:', error.message);
        }
    }

    try {
        console.log('Checking for other missing columns...');
        // Add other columns if needed
        // await sequelize.query('ALTER TABLE orders ADD COLUMN ...');
    } catch (error) {
        console.error('Error during schema check:', error.message);
    }

    process.exit();
}

fixSchema();
