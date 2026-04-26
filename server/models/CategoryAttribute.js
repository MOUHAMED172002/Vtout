import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CategoryAttribute = sequelize.define('CategoryAttribute', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    attribute_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'category_attributes',
    underscored: true,
    timestamps: false
});

export default CategoryAttribute;
