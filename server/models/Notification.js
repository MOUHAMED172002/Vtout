import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        allowNull: false
    },
    user_id: {
        type: DataTypes.CHAR(36),
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING(50),
        defaultValue: 'info' // wallet, order, alert, info
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'notifications',
    underscored: true
});

export default Notification;
