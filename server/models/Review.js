const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
    id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        allowNull: false
    },
    user_id: {
        type: DataTypes.CHAR(36),
        allowNull: false
    },
    product_id: {
        type: DataTypes.CHAR(36),
        allowNull: false
    },
    order_id: {
        type: DataTypes.CHAR(36)
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    title: {
        type: DataTypes.STRING(255)
    },
    body: {
        type: DataTypes.TEXT
    },
    images: {
        type: DataTypes.JSON,
        defaultValue: []
    }
}, {
    tableName: 'reviews',
    underscored: true
});

module.exports = Review;
