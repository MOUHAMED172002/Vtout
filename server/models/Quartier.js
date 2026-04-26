import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Quartier = sequelize.define('Quartier', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    arrondissement_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    }
}, {
    tableName: 'quartiers',
    underscored: true,
    timestamps: true
});

export default Quartier;
