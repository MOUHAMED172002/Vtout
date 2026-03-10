require('dotenv').config();
const { Sequelize } = require('sequelize');
console.log('Testing connection...');
const sequelize = new Sequelize(process.env.MYSQL_DATABASE_URL || 'mysql://root:@127.0.0.1:3306/eshop_db');
sequelize.authenticate()
    .then(() => {
        console.log('Connection successful!');
        process.exit(0);
    })
    .catch(err => {
        console.error('Connection failed:', err);
        process.exit(1);
    });
