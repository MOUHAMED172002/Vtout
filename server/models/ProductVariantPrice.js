import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ProductVariantPrice = sequelize.define('ProductVariantPrice', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    variant_id: {
        type: DataTypes.CHAR(36),
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
        // Stock physique réel de cette variante — décrémenté seulement à la
        // LIVRAISON (voir reserved_stock ci-dessous).
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    reserved_stock: {
        // Quantité retenue par des commandes en cours pour cette variante.
        // Disponible à l'achat = stock - reserved_stock.
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    image_url: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'product_variant_prices',
    underscored: true
});

export default ProductVariantPrice;
