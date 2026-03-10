const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CategoryAttribute = sequelize.define('CategoryAttribute', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    attribute_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'category_attributes',
    underscored: true,
    timestamps: false
});

module.exports = CategoryAttribute;
