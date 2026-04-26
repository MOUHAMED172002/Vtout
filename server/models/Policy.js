import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Policy = sequelize.define('Policy', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('general', 'supplier', 'delivery', 'cgv'),
        defaultValue: 'general'
    }
}, {
    tableName: 'policies',
    underscored: true
});

export default Policy;
