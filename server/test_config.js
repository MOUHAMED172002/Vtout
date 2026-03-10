require('dotenv').config();
console.log('Loading config...');
const sequelize = require('./config/database');
console.log('Config loaded');
process.exit(0);
