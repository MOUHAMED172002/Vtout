import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const FailedSearch = sequelize.define('FailedSearch', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    query: {
        type: DataTypes.STRING,
        allowNull: false
    },
    user_id: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Clerk user ID if authenticated'
    },
    results_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'failed_searches',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default FailedSearch;
