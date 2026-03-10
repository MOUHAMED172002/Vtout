const { Sequelize } = require('sequelize');
require('dotenv').config();

const dbUrl = process.env.MYSQL_DATABASE_URL || 'mysql://root:@localhost:3306/eshop_db';
const sequelize = new Sequelize(dbUrl, { logging: false });

async function checkProfiles() {
    try {
        await sequelize.authenticate();
        console.log('Connection established.');

        const [results] = await sequelize.query("SELECT clerk_id, email, role FROM profiles");
        console.log('--- Profiles ---');
        console.table(results);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkProfiles();
