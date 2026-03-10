const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Favorite = sequelize.define('Favorite', {
    id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        allowNull: false
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
    metadata: {
        type: DataTypes.JSON,
        defaultValue: {}
    }
}, {
    tableName: 'favorites',
    underscored: true,
    updatedAt: false // Le schéma SQL n'a que created_at
});

module.exports = Favorite;
