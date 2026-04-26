import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PlatformReview = sequelize.define('PlatformReview', {
    id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        allowNull: false
    },
    user_id: {
        type: DataTypes.CHAR(36),
        allowNull: false
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 }
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('visible', 'hidden'),
        defaultValue: 'visible'
    }
}, {
    tableName: 'platform_reviews',
    underscored: true
});

export default PlatformReview;
