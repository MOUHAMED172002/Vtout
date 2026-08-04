import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Une ligne par filleul (referred_id est unique : un compte ne peut être
// parrainé qu'une seule fois). La récompense du parrain n'est accordée
// qu'à la première commande confirmée du filleul (voir orderController.js),
// pour éviter les faux comptes créés uniquement pour récolter des coupons.
const Referral = sequelize.define('Referral', {
    id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    referrer_id: {
        type: DataTypes.CHAR(36),
        allowNull: false
    },
    referred_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        unique: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'rewarded'),
        defaultValue: 'pending'
    },
    order_id: {
        type: DataTypes.CHAR(36),
        allowNull: true
    },
    referrer_coupon_code: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    referred_coupon_code: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    rewarded_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'referrals',
    underscored: true
});

export default Referral;
