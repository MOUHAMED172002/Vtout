require('dotenv').config();
const { sequelize, Category, Product, ProductImage } = require('./models/index_debug');

async function seed() {
    try {
        console.log('⏳ Connecting...');
        await sequelize.authenticate();
        console.log('✅ Connected.');

        console.log('⏳ Syncing...');
        await sequelize.sync({ force: true });
        console.log('✅ Synced.');

        const cat = await Category.create({ name: 'Debug Cat' });
        console.log('✅ Category created:', cat.id);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

seed();
