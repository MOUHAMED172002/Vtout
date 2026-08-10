import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Représente une tentative de paiement en ligne (fedapay/mobile_money/card)
// AVANT que la commande ne soit réellement créée. Le panier client est
// entièrement validé, tarifé et le stock déjà réservé (reserved_stock) au
// moment de la création de cette ligne — mais AUCUNE ligne `orders` n'existe
// tant que le paiement n'est pas confirmé (webhook, callback de redirection,
// ou confirmation explicite depuis le widget embarqué). Voir
// orderController.js (createOrder / materializePendingCheckout).
const PendingCheckout = sequelize.define('PendingCheckout', {
    id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        allowNull: false
    },
    user_id: {
        type: DataTypes.CHAR(36),
        allowNull: true // null pour un checkout invité
    },
    // JSON sérialisé : { boutiqueOrders: [...], coupon: {...}|null } — déjà
    // entièrement calculé (prix, remise, frais de livraison, kit, répartition
    // multi-boutique) au moment du checkout, rejoué tel quel à la
    // matérialisation pour ne jamais recalculer/dupliquer cette logique.
    payload: {
        type: DataTypes.TEXT('long'),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'expired', 'failed'),
        defaultValue: 'pending'
    },
    fedapay_transaction_id: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    // JSON array des order.id créés une fois confirmé (le premier est la
    // commande "parent" en cas de scission multi-boutique).
    resulting_order_ids: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'pending_checkouts',
    underscored: true
});

export default PendingCheckout;
