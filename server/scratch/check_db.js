import { sequelize } from '../models/index.js';
try {
    const [results] = await sequelize.query('DESCRIBE products');
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
} catch (error) {
    console.error(error);
    process.exit(1);
}
