// KIT PROMOTIONS — DÉSACTIVÉ (non importé dans models/index.js)
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Kit = sequelize.define('Kit', {
    id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    bundle_price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    boutique_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        references: { model: 'boutiques', key: 'id' }
    },
    supplier_id: {
        type: DataTypes.CHAR(36),
        allowNull: true,
        references: { model: 'suppliers', key: 'id' }
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'kits',
    underscored: true
});

export default Kit;
