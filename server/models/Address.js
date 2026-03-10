const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Address = sequelize.define('Address', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.CHAR(36),
        allowNull: true  // null for guest addresses
    },
    label: {
        type: DataTypes.STRING(100)
    },
    departement_id: {
        type: DataTypes.STRING(10)
    },
    departement_label: {
        type: DataTypes.STRING(100)
    },
    commune_id: {
        type: DataTypes.STRING(10)
    },
    commune_label: {
        type: DataTypes.STRING(100)
    },
    quartier_id: {
        type: DataTypes.STRING(10)
    },
    quartier_label: {
        type: DataTypes.STRING(100)
    },
    address_line: {
        type: DataTypes.TEXT
    },
    phone: {
        type: DataTypes.STRING(20)
    },
    lat: {
        type: DataTypes.DECIMAL(10, 8)
    },
    lng: {
        type: DataTypes.DECIMAL(11, 8)
    },
    is_default: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'addresses',
    underscored: true
});

module.exports = Address;
