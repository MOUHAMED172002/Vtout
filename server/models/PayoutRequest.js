import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PayoutRequest = sequelize.define('PayoutRequest', {
    id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        allowNull: false
    },
    user_id: {
        type: DataTypes.CHAR(36),
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('fournisseur', 'livreur'),
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    payment_method: {
        type: DataTypes.STRING(50),
        allowNull: false // e.g., 'momo', 'bank'
    },
    payment_details: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'paid'),
        defaultValue: 'pending'
    },
    admin_notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    processed_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'payout_requests',
    underscored: true
});

export default PayoutRequest;
