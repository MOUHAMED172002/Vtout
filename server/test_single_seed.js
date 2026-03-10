require('dotenv').config();
const { Category, sequelize } = require('./models');

async function test() {
    try {
        console.log('Authenticating...');
        await sequelize.authenticate();
        console.log('Authenticated.');

        console.log('Syncing...');
        await sequelize.sync({ force: false });
        console.log('Synced.');

        console.log('Creating category...');
        const cat = await Category.create({ name: 'Test Cat' });
        console.log('Created:', cat.id);

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

test();
