import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ProductAttribute = sequelize.define('ProductAttribute', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'product_attributes',
    underscored: true
});

export default ProductAttribute;
