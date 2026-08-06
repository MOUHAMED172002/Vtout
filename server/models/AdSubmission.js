import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Une réclamation de campagne par un distributeur, avec son cycle de preuve en
// 2 captures (+ éventuelle capture "live" demandée aléatoirement par l'admin) :
//
//   pending           → campagne réclamée, en attente de la capture précoce
//   awaiting_late     → capture précoce reçue, en attente de la capture tardive
//   live_check        → capture "toujours en ligne" demandée par l'admin, en attente
//   under_review      → les 2 captures sont là, en file de modération admin
//   verified          → validée par l'admin, en attente de paiement
//   paid              → payée
//   rejected          → refusée (fraude détectée, capture manquante, hors délai...)
const AdSubmission = sequelize.define('AdSubmission', {
    id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        allowNull: false
    },
    campaign_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    distributor_id: {
        // = AdDistributorProfile.id
        type: DataTypes.CHAR(36),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'awaiting_late', 'live_check', 'under_review', 'verified', 'paid', 'rejected'),
        defaultValue: 'pending'
    },
    reward_amount: {
        // Figé au moment de la réclamation — n'évolue pas si l'admin change le
        // montant de la campagne ensuite.
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    claimed_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },

    // Capture précoce (dans l'heure suivant la publication)
    screenshot_early_url: { type: DataTypes.TEXT, allowNull: true },
    screenshot_early_hash: { type: DataTypes.STRING(64), allowNull: true },
    screenshot_early_at: { type: DataTypes.DATE, allowNull: true },

    // Capture tardive (juste avant l'expiration des 24h du Statut)
    screenshot_late_url: { type: DataTypes.TEXT, allowNull: true },
    screenshot_late_hash: { type: DataTypes.STRING(64), allowNull: true },
    screenshot_late_at: { type: DataTypes.DATE, allowNull: true },

    // Vérification "live" aléatoire — capture fraîche demandée à l'instant
    live_check_requested_at: { type: DataTypes.DATE, allowNull: true },
    live_check_screenshot_url: { type: DataTypes.TEXT, allowNull: true },
    live_check_submitted_at: { type: DataTypes.DATE, allowNull: true },

    flagged: {
        // true = doublon détecté ou anomalie — mis en avant dans la file de modération.
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    flag_reason: { type: DataTypes.TEXT, allowNull: true },

    // Le paiement (manuel, comme les PayoutRequest fournisseurs) n'est proposé
    // à l'admin qu'à partir de cette date — délai pour les nouveaux comptes.
    payout_eligible_at: { type: DataTypes.DATE, allowNull: true },
    paid_at: { type: DataTypes.DATE, allowNull: true },
    rejection_reason: { type: DataTypes.TEXT, allowNull: true },
    admin_notes: { type: DataTypes.TEXT, allowNull: true }
}, {
    tableName: 'ad_submissions',
    underscored: true
});

export default AdSubmission;
