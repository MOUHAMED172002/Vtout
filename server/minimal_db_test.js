const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('Starting minimal DB test...');
const sequelize = new Sequelize('mysql://root:@127.0.0.1:3306/eshop_db', {
    dialect: 'mysql',
    logging: console.log
});

async function test() {
    try {
        console.log('Authenticating...');
        await sequelize.authenticate();
        console.log('Successfully connected!');
        await sequelize.close();
        process.exit(0);
    } catch (e) {
        console.error('Connection failed:', e);
        process.exit(1);
    }
}

test();
