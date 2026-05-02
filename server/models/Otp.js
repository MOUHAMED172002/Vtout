import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Otp = sequelize.define('Otp', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    is_used: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'otps',
    underscored: true
});

export default Otp;
