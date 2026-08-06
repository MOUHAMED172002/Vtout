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
    rate_per_view: {
        // FCFA versés par vue du Statut — la récompense réelle d'une soumission
        // (AdSubmission.reward_amount) est calculée à l'approbation : vues × ce taux.
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    min_views: {
        // Nombre de vues minimum pour être éligible au paiement (informatif —
        // affiché à l'admin en modération, qui garde la décision finale).
        type: DataTypes.INTEGER,
        allowNull: true
    },
    max_reward_amount: {
        // Plafond FCFA par soumission, quel que soit le nombre de vues. Null = pas de plafond.
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true
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
        // Fenêtre pendant laquelle la campagne accepte de NOUVELLES réclamations —
        // sans rapport avec le délai individuel de chaque distributeur, qui est
        // toujours fixe à 24h après sa réclamation (voir AdSubmission.claim_deadline_at).
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
