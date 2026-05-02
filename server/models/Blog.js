import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Blog = sequelize.define('Blog', {
    id: {
        type: DataTypes.CHAR(36),
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    summary: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT('long'),
        allowNull: false
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    category: {
        type: DataTypes.STRING,
        defaultValue: 'Général'
    },
    author_id: {
        type: DataTypes.CHAR(36),
        allowNull: true
    },
    is_published: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    published_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    meta_title: {
        type: DataTypes.STRING,
        allowNull: true
    },
    meta_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    tags: {
        type: DataTypes.STRING, // Stocké sous forme de chaîne séparée par des virgules
        allowNull: true
    }
}, {
    tableName: 'blogs',
    underscored: true,
    timestamps: true
});

export default Blog;
