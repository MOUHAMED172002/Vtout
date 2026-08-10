import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT('long')
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    old_price: {
        type: DataTypes.DECIMAL(15, 2)
    },
    stock: {
        // Stock physique réel — décrémenté seulement à la LIVRAISON, jamais
        // à la simple création de commande (voir reserved_stock ci-dessous).
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    reserved_stock: {
        // Quantité retenue par des commandes en cours (créées mais pas
        // encore livrées, ni annulées) — jamais négatif. Le stock réellement
        // disponible à l'achat = stock - reserved_stock. Évite la survente
        // sans décrémenter le stock physique avant que la vente soit
        // effective (livrée).
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    is_flash_sale: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    flash_sale_end: {
        type: DataTypes.DATE
    },
    supplier_id: {
        type: DataTypes.CHAR(36),
        allowNull: true,
        references: {
            model: 'suppliers',
            key: 'id'
        }
    },
    supplier_price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true
    },
    cost_price: {
        // Prix d'achat réel noté par le vendeur (mémo privé, jamais exposé au client ni
        // dans le catalogue admin général) — sert uniquement à calculer sa marge dans
        // son propre supplier-portal. Voir supplierController.js pour l'exclusion des
        // endpoints publics/admin.
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true
    },
    approval_status: {
        type: DataTypes.ENUM('En attente', 'approved', 'rejected'),
        defaultValue: 'En attente'
    },
    admin_feedback: {
        type: DataTypes.TEXT('long')
    },
    in_stock_supplier: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    boutique_id: {
        type: DataTypes.CHAR(36),
        allowNull: true,
        references: {
            model: 'boutiques',
            key: 'id'
        }
    },
    secondary_boutique_ids: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
            const val = this.getDataValue('secondary_boutique_ids');
            if (!val) return null;
            try { return JSON.parse(val); } catch { return val; }
        },
        set(val) {
            this.setDataValue('secondary_boutique_ids', val ? JSON.stringify(val) : null);
        }
    },
    supplier_note: {
        type: DataTypes.TEXT('long'),
        allowNull: true
    },
    is_kit: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    kit_items: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
            const val = this.getDataValue('kit_items');
            if (!val) return null;
            try { return JSON.parse(val); } catch { return val; }
        },
        set(val) {
            this.setDataValue('kit_items', val ? JSON.stringify(val) : null);
        }
    },
    volume_pricing: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
            const val = this.getDataValue('volume_pricing');
            if (!val) return null;
            try { return JSON.parse(val); } catch { return val; }
        },
        set(val) {
            this.setDataValue('volume_pricing', val ? JSON.stringify(val) : null);
        }
    },
    total_sold: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'products',
    underscored: true
});

export default Product;
