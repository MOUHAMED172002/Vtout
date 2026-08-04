import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Profile = sequelize.define('Profile', {
    id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    fullname: {
        type: DataTypes.STRING
    },
    first_name: {
        type: DataTypes.STRING(128)
    },
    last_name: {
        type: DataTypes.STRING(128)
    },
    username: {
        type: DataTypes.STRING(128),
        unique: true
    },
    phone: {
        type: DataTypes.STRING(20),
        unique: true
    },
    avatar_url: {
        type: DataTypes.TEXT
    },
    role: {
        type: DataTypes.ENUM('user', 'admin', 'vendeur', 'fournisseur', 'livreur'),
        defaultValue: 'user'
    },
    email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    phone_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    locale: {
        type: DataTypes.STRING(10)
    },
    clerk_id: {
        type: DataTypes.STRING
    },
    password_reset_token: {
        type: DataTypes.STRING
    },
    password_reset_expires_at: {
        type: DataTypes.DATE
    },
    last_password_change_at: {
        type: DataTypes.DATE
    },
    last_sign_in_at: {
        type: DataTypes.DATE
    },
    deleted_at: {
        type: DataTypes.DATE
    },
    referral_code: {
        type: DataTypes.STRING(12),
        unique: true
    },
    providers: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    metadata: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    clerk_raw: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    last_abandoned_reminder_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    last_reengagement_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    last_vip_message_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'profiles',
    underscored: true
});

export default Profile;
