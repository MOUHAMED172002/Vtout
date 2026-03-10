const { Sequelize } = require('sequelize');
require('dotenv').config();

const dbUrl = process.env.MYSQL_DATABASE_URL || 'mysql://root:@localhost:3306/eshop_db';
const sequelize = new Sequelize(dbUrl, { logging: false });

async function checkSchema() {
    try {
        await sequelize.authenticate();
        console.log('Connection established.');

        const [results] = await sequelize.query("DESCRIBE addresses");
        console.log('--- Addresses Schema ---');
        console.table(results);

        const [favResults] = await sequelize.query("DESCRIBE favorites");
        console.log('--- Favorites Schema ---');
        console.table(favResults);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkSchema();
