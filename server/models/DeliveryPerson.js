import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

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
    },
    lat: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true
    },
    lng: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true
    },
    last_location_update: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'delivery_persons',
    underscored: true
});

export default DeliveryPerson;
