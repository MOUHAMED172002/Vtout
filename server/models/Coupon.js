import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Coupon = sequelize.define('Coupon', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    discount_type: {
        type: DataTypes.ENUM('percentage', 'fixed_amount'),
        defaultValue: 'percentage'
    },
    discount_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    min_order_amount: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    usage_limit: {
        type: DataTypes.INTEGER,
        allowNull: true // Null means unlimited
    },
    used_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    supplier_id: {
        type: DataTypes.CHAR(36),
        allowNull: true // If null, it's a platform-wide coupon from admin
    }
}, {
    tableName: 'coupons',
    underscored: true
});

export default Coupon;
