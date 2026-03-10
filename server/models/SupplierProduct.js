const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SupplierProduct = sequelize.define('SupplierProduct', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    supplier_id: {
        type: DataTypes.CHAR(36),
        allowNull: false
    },
    product_id: {
        type: DataTypes.CHAR(36),
        allowNull: false
    },
    variant_id: {
        type: DataTypes.CHAR(36),
        allowNull: true
    },
    supplier_sku: {
        type: DataTypes.STRING
    },
    supplier_price: {
        type: DataTypes.DECIMAL(15, 2)
    },
    available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'supplier_products',
    underscored: true
});

module.exports = SupplierProduct;
