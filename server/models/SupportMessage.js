import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SupportMessage = sequelize.define('SupportMessage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    conversation_id: {
        type: DataTypes.STRING, // e.g., 'user_id_admin' or similar
        allowNull: false
    },
    sender_id: {
        type: DataTypes.CHAR(36),
        allowNull: false
    },
    receiver_id: {
        type: DataTypes.CHAR(36),
        allowNull: true // If null, maybe it's broadcast or pending admin
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    attachment_url: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'support_messages',
    underscored: true
});

export default SupportMessage;
