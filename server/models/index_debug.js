const sequelize = require('../config/database');
const Category = require('./Category');
const Product = require('./Product');
const ProductImage = require('./ProductImage');

module.exports = {
    sequelize,
    Category,
    Product,
    ProductImage
};
