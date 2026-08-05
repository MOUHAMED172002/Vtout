import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Coupon = sequelize.define('Coupon', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    discount_type: {
        type: DataTypes.ENUM('percentage', 'fixed_amount', 'free_shipping'),
        defaultValue: 'percentage'
    },
    discount_value: {
        // Sans objet pour 'free_shipping' (peut rester à 0/null dans ce cas).
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    max_discount_amount: {
        // Plafond en FCFA pour les réductions en pourcentage (ex: -10% plafonné à 5000 F). Null = pas de plafond.
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true
    },
    min_order_amount: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00
    },
    category_id: {
        // Si renseigné, la réduction ne s'applique qu'aux articles de cette catégorie.
        type: DataTypes.INTEGER,
        allowNull: true
    },
    assigned_user_id: {
        // Code personnel : si renseigné, seul ce client peut l'utiliser.
        type: DataTypes.CHAR(36),
        allowNull: true
    },
    first_order_only: {
        // Code de bienvenue : valable uniquement si le client n'a jamais eu de commande payée.
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    usage_limit: {
        type: DataTypes.INTEGER,
        allowNull: true // Null means unlimited
    },
    used_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    supplier_id: {
        type: DataTypes.CHAR(36),
        allowNull: true // If null, it's a platform-wide coupon from admin
    }
}, {
    tableName: 'coupons',
    underscored: true
});

export default Coupon;
