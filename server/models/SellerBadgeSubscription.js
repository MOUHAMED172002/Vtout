import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Historique des paiements d'abonnement au badge "Vendeur Certifié"
const SellerBadgeSubscription = sequelize.define('SellerBadgeSubscription', {
    id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        allowNull: false
    },
    supplier_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        references: {
            model: 'suppliers',
            key: 'id'
        }
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    months: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    status: {
        type: DataTypes.ENUM('pending', 'paid', 'failed'),
        defaultValue: 'pending'
    },
    payment_id: {
        type: DataTypes.STRING(64),
        allowNull: true
    },
    period_start: {
        type: DataTypes.DATE,
        allowNull: true
    },
    period_end: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'seller_badge_subscriptions',
    underscored: true
});

export default SellerBadgeSubscription;
