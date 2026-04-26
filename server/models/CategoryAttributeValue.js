import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CategoryAttributeValue = sequelize.define('CategoryAttributeValue', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    category_attribute_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    value_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'category_attribute_values',
    underscored: true,
    timestamps: false
});

export default CategoryAttributeValue;
