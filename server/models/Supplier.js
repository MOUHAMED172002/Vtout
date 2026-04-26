import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Supplier = sequelize.define('Supplier', {
    id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING
    },
    user_id: {
        type: DataTypes.CHAR(36),
        allowNull: true,
        references: {
            model: 'profiles',
            key: 'id'
        }
    },
    address_line: {
        type: DataTypes.STRING
    },
    whatsapp: {
        type: DataTypes.STRING
    },
    momo_number: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.ENUM('En attente', 'active', 'suspended'),
        defaultValue: 'En attente'
    },
    terms_accepted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    electronic_signature: {
        type: DataTypes.STRING,
        allowNull: true
    },
    departement_id: {
        type: DataTypes.STRING
    },
    departement_label: {
        type: DataTypes.STRING
    },
    commune_id: {
        type: DataTypes.STRING
    },
    commune_label: {
        type: DataTypes.STRING
    },
    quartier_id: {
        type: DataTypes.STRING
    },
    quartier_label: {
        type: DataTypes.STRING
    },
    lat: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true
    },
    lng: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true
    }
}, {
    tableName: 'suppliers',
    underscored: true
});

export default Supplier;
