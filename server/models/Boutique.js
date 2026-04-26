
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Boutique = sequelize.define('Boutique', {
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
    whatsapp: {
        type: DataTypes.STRING
    },
    momo_number: {
        type: DataTypes.STRING
    },
    address_line: {
        type: DataTypes.STRING
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
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended'),
        defaultValue: 'active'
    },
    supplier_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        references: {
            model: 'suppliers',
            key: 'id'
        }
    }
}, {
    tableName: 'boutiques',
    underscored: true
});

export default Boutique;
