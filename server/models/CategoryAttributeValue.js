const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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

module.exports = CategoryAttributeValue;
