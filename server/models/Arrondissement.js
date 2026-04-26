import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Arrondissement = sequelize.define('Arrondissement', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    commune_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    }
}, {
    tableName: 'arrondissements',
    underscored: true,
    timestamps: true
});

export default Arrondissement;
