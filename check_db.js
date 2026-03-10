const sequelize = require('./server/config/database');
require('dotenv').config({ path: 'server/.env' });

async function check() {
    try {
        const [results] = await sequelize.query("DESCRIBE products");
        console.log('Columns:', results.map(r => r.Field).join(', '));
    } catch (err) {
        console.error('ERROR:', err.message);
    } finally {
        await sequelize.close();
    }
}
check();
