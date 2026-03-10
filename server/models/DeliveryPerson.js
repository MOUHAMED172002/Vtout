const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DeliveryPerson = sequelize.define('DeliveryPerson', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        unique: true,
        references: {
            model: 'profiles',
            key: 'id'
        }
    },
    vehicle_type: {
        type: DataTypes.STRING(50), // 'moto', 'car', 'bicycle'
        allowNull: false
    },
    license_plate: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    vehicle_model: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('disponible', 'occupé', 'hors_ligne'),
        defaultValue: 'disponible'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    rating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 5.00
    },
    total_deliveries: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    id_card_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    service_zones: {
        type: DataTypes.JSON,
        defaultValue: [] // Array of communes/zones
    }
}, {
    tableName: 'delivery_persons',
    underscored: true
});

module.exports = DeliveryPerson;
