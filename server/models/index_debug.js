import sequelize from '../config/database.js';
const Category = require('./Category');
const Product = require('./Product');
const ProductImage = require('./ProductImage');

export {
    sequelize,
    Category,
    Product,
    ProductImage
};
