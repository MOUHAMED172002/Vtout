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
        allowNull: false
    },
    supplier_id: {
        type: DataTypes.CHAR(36),
        allowNull: false
    },
    motif: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    reason: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    photo_url: {
        type: DataTypes.TEXT,
        allowNull: true
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
    },
    status_history: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    admin_notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    supplier_response: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    supplier_evidence_url: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    refund_amount: {
        type: DataTypes.DECIMAL(12, 0),
        allowNull: true
    }
}, {
    tableName: 'disputes',
    underscored: true
});

export default Dispute;
