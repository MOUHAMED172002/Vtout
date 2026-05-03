import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Commune = sequelize.define('Commune', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    department_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    }
}, {
    tableName: 'communes',
    underscored: true,
    timestamps: true
});

export default Commune;
