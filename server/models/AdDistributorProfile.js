import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Casquette "distributeur" d'un compte — un Profile peut avoir 0 ou 1 fiche ici
// (comme Supplier/DeliveryPerson : casquette additionnelle, pas un rôle exclusif).
const AdDistributorProfile = sequelize.define('AdDistributorProfile', {
    id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        allowNull: false
    },
    user_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        unique: true
    },
    verified_phone: {
        // Numéro WhatsApp vérifié par OTP — c'est aussi celui utilisé pour le
        // paiement Mobile Money par défaut (momo_number peut le surcharger).
        type: DataTypes.STRING(20),
        allowNull: true
    },
    phone_verified_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    momo_number: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    trust_level: {
        // 'new' = paiement différé + revue systématique. 'trusted' = paiement
        // rapide après revue. 'banned' = ne peut plus réclamer de campagne.
        type: DataTypes.ENUM('new', 'trusted', 'banned'),
        defaultValue: 'new'
    },
    total_submissions: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    total_verified: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    total_paid_amount: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0
    },
    flag_count: {
        // Nombre de fois où une soumission de ce compte a été flaguée (doublon
        // détecté, capture live manquante...) — utilisé pour décider du bannissement.
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    banned_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    ban_reason: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'ad_distributor_profiles',
    underscored: true
});

export default AdDistributorProfile;
