import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT('long')
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    old_price: {
        type: DataTypes.DECIMAL(15, 2)
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    is_flash_sale: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    flash_sale_end: {
        type: DataTypes.DATE
    },
    supplier_id: {
        type: DataTypes.CHAR(36),
        allowNull: true,
        references: {
            model: 'suppliers',
            key: 'id'
        }
    },
    supplier_price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true
    },
    approval_status: {
        type: DataTypes.ENUM('En attente', 'approved', 'rejected'),
        defaultValue: 'En attente'
    },
    admin_feedback: {
        type: DataTypes.TEXT('long')
    },
    in_stock_supplier: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    boutique_id: {
        type: DataTypes.CHAR(36),
        allowNull: true,
        references: {
            model: 'boutiques',
            key: 'id'
        }
    },
    supplier_note: {
        type: DataTypes.TEXT('long'),
        allowNull: true
    }
}, {
    tableName: 'products',
    underscored: true
});

export default Product;
