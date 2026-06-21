import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const KitComponent = sequelize.define('KitComponent', {
    kit_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        references: { model: 'kits', key: 'id' }
    },
    product_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        references: { model: 'products', key: 'id' }
    }
}, {
    tableName: 'kit_components',
    underscored: true,
    timestamps: false
});

export default KitComponent;
