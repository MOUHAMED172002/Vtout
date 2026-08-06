import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Une campagne publicitaire à diffuser via le Statut WhatsApp des distributeurs
// (créée par l'admin — l'annonceur passe par lui, pas d'auto-service pour l'instant).
const AdCampaign = sequelize.define('AdCampaign', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    creative_url: {
        // L'image/visuel que le distributeur doit poster en Statut.
        type: DataTypes.TEXT,
        allowNull: false
    },
    reward_amount: {
        // Montant FCFA versé par soumission validée.
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    max_distributors: {
        // Nombre de places — null = illimité.
        type: DataTypes.INTEGER,
        allowNull: true
    },
    claimed_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('active', 'paused', 'completed'),
        defaultValue: 'active'
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end_date: {
        // Après cette date, la campagne n'accepte plus de nouvelles réclamations.
        type: DataTypes.DATE,
        allowNull: false
    },
    created_by: {
        type: DataTypes.CHAR(36),
        allowNull: true
    }
}, {
    tableName: 'ad_campaigns',
    underscored: true
});

export default AdCampaign;
