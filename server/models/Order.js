const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        allowNull: false
    },
    user_id: {
        type: DataTypes.CHAR(36),
        allowNull: true  // null for guest orders
    },
    guest_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    guest_email: {
        type: DataTypes.STRING(150),
        allowNull: true
    },
    guest_phone: {
        type: DataTypes.STRING(30),
        allowNull: true
    },
    address_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    total_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.STRING(50),
        defaultValue: 'en_attente'
        // en_attente, confirmée, expédiée, livrée, annulée
    },
    payment_method: {
        type: DataTypes.STRING(50)
    },
    items_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    payment_id: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    payment_status: {
        type: DataTypes.STRING(20),
        defaultValue: 'en_attente'
        // 'en_attente', 'payé', 'non_payé'
    },
    delivery_person_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'delivery_persons',
            key: 'id'
        }
    },
    supplier_id: {
        type: DataTypes.CHAR(36),
        allowNull: true,
        references: {
            model: 'suppliers',
            key: 'id'
        }
    },
    assigned_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    picked_up_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    delivered_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    proof_url: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    invoice_sent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    is_parent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    parent_id: {
        type: DataTypes.CHAR(36),
        allowNull: true
    },
    delivery_fee: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    distance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true // km
    },
    delivery_code: {
        type: DataTypes.STRING(20),
        allowNull: true
    }
}, {
    tableName: 'orders',
    underscored: true
});

module.exports = Order;
