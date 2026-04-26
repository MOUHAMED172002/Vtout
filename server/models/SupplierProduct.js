import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

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
    },
    approval_status: {
        type: DataTypes.ENUM('En attente', 'approved', 'rejected'),
        defaultValue: 'En attente'
    },
    admin_feedback: {
        type: DataTypes.TEXT('long')
    }
}, {
    tableName: 'supplier_products',
    underscored: true
});

export default SupplierProduct;
