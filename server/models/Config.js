import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Config = sequelize.define('Config', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    value: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    group: {
        type: DataTypes.STRING, // e.g., 'social', 'api', 'branding'
        defaultValue: 'general'
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'configs',
    underscored: true
});

export default Config;
