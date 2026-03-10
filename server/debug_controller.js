const productController = require('./controllers/productController');
const { sequelize } = require('./models');
require('dotenv').config({ override: true });

async function debug() {
    const req = { query: { limit: 20 }, params: { id: "7d706240-c3bd-4849-9a71-4668c3b2faf8" } };
    const res = {
        json: (data) => console.log('RESPONSE_JSON:', JSON.stringify(data).substring(0, 100)),
        status: (code) => {
            console.log('RESPONSE_STATUS:', code);
            return res;
        }
    };

    try {
        await productController.getProductById(req, res);
    } catch (err) {
        console.error('CONTROLLER_CRASH:', err);
    } finally {
        await sequelize.close();
    }
}

debug();
