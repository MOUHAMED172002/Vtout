import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Cart = sequelize.define('Cart', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
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
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    price_snapshot: {
        type: DataTypes.DECIMAL(15, 2)
    },
    image_url: {
        type: DataTypes.TEXT
    },
    selected_attributes: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    kit_id: {
        type: DataTypes.CHAR(36),
        allowNull: true,
        defaultValue: null
    }
}, {
    tableName: 'cart_items',
    underscored: true
});

export default Cart;
