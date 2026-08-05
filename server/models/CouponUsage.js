import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Une ligne par utilisation réelle d'un coupon (contrairement à
// coupons.used_count qui n'est qu'un compteur global). Permet le suivi
// admin (qui a utilisé quel code, sur quelle commande) et les règles
// anti-fraude comme "un seul code de bienvenue par compte".
const CouponUsage = sequelize.define('CouponUsage', {
    id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        allowNull: false
    },
    coupon_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user_id: {
        type: DataTypes.CHAR(36),
        allowNull: true // null possible pour un achat invité
    },
    order_id: {
        type: DataTypes.CHAR(36),
        allowNull: true
    },
    discount_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: 'coupon_usages',
    underscored: true,
    updatedAt: false
});

export default CouponUsage;
