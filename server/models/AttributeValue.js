import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AttributeValue = sequelize.define('AttributeValue', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    attribute_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    value: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'product_attribute_values',
    underscored: true
});

export default AttributeValue;
