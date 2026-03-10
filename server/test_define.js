const { Sequelize, DataTypes } = require('sequelize');
console.log('Sequelize imported');
const sequelize = new Sequelize('mysql://root:@127.0.0.1:3306/eshop_db', { logging: false });
console.log('Sequelize instance created');
const Test = sequelize.define('Test', {
    name: DataTypes.STRING
});
console.log('Model defined');
process.exit(0);
