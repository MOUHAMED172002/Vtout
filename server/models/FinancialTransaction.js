import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const FinancialTransaction = sequelize.define('FinancialTransaction', {
    id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        allowNull: false
    },
    user_id: {
        type: DataTypes.CHAR(36),
        allowNull: false
    },
    order_id: {
        type: DataTypes.CHAR(36),
        allowNull: true
    },
    type: {
        type: DataTypes.ENUM('earning', 'payout', 'adjustment'),
        allowNull: false
    },
    // Optional source to distinguish who this earning belongs to (supplier, deliverer, platform, etc.)
    source: {
        type: DataTypes.STRING(32),
        allowNull: true
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
        defaultValue: 'completed'
    }
}, {
    tableName: 'financial_transactions',
    underscored: true
});

export default FinancialTransaction;
