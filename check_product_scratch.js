import { Product } from './server/models/index.js';
import sequelize from './server/config/database.js';

async function check() {
  try {
    const p = await Product.findOne({ where: { price: 41000 } });
    if (p) {
      console.log('--- PRODUCT FOUND ---');
      console.log(JSON.stringify(p.toJSON(), null, 2));
    } else {
      console.log('No product found with price 41000');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

check();
