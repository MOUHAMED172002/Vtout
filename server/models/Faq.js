import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Faq = sequelize.define('Faq', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    question: {
        type: DataTypes.STRING,
        allowNull: false
    },
    answer: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    tableName: 'faqs',
    underscored: true
});

export default Faq;
