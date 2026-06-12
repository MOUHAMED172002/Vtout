import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    parent_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    icon: {
        type: DataTypes.TEXT
    },
    commission_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: null,
        field: 'commission_rate' // Force mapping
    },
    display_order: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    }
}, {
    tableName: 'categories',
    underscored: true,
    timestamps: false // Le schéma SQL n'a que created_at
});

export default Category;
