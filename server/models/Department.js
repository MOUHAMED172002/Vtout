import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Department = sequelize.define('Department', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    }
}, {
    tableName: 'departments',
    underscored: true,
    timestamps: true
});

export default Department;
