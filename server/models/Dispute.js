import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Dispute = sequelize.define('Dispute', {
    id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        allowNull: false
    },
    order_id: {
        type: DataTypes.CHAR(36),
        allowNull: false
    },
    user_id: {
        type: DataTypes.CHAR(36),
        allowNull: false // Requester
    },
    supplier_id: {
        type: DataTypes.CHAR(36),
        allowNull: false
    },
    reason: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('open', 'under_review', 'resolved', 'cancelled'),
        defaultValue: 'open'
    },
    resolution: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    resolved_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'disputes',
    underscored: true
});

export default Dispute;
