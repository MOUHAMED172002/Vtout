const { Product } = require('./server/models');
const sequelize = require('./server/config/database');

async function test() {
    try {
        const products = await Product.findAll({ limit: 1 });
        console.log('Success:', products.length);
    } catch (err) {
        console.error('ERROR_FOUND:', err.message);
        if (err.parent) console.error('PARENT_ERROR:', err.parent.message);
    } finally {
        await sequelize.close();
    }
}

test();
