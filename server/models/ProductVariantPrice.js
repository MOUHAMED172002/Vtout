import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ProductVariantPrice = sequelize.define('ProductVariantPrice', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    variant_id: {
        type: DataTypes.CHAR(36),
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
    image_url: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'product_variant_prices',
    underscored: true
});

export default ProductVariantPrice;
