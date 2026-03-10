require('dotenv').config();
console.log('Loading Category...');
const Category = require('./models/Category');
console.log('Category loaded');
console.log('Loading Product...');
const Product = require('./models/Product');
console.log('Product loaded');
process.exit(0);
