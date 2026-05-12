import { DataTypes } from 'sequelize';
import { sequelize } from '../models/index.js';

/**
 * Synchronise automatiquement les colonnes manquantes entre les modèles Sequelize
 * et la base de données réelle, sans supprimer aucune donnée existante.
 * 
 * POST /api/admin/sync-db  (requireAdmin)
 */
export const syncDatabase = async (req, res) => {
    const qi = sequelize.getQueryInterface();
    const results = { added: [], skipped: [], errors: [] };

    // Définition exhaustive de toutes les colonnes attendues par modèle
    const schema = {
        products: {
            boutique_id:            { type: DataTypes.CHAR(36), allowNull: true },
            secondary_boutique_ids: { type: DataTypes.JSON,     allowNull: true },
            supplier_note:          { type: DataTypes.TEXT('long'), allowNull: true },
            in_stock_supplier:      { type: DataTypes.BOOLEAN,  defaultValue: true },
            admin_feedback:         { type: DataTypes.TEXT('long'), allowNull: true },
            supplier_price:         { type: DataTypes.DECIMAL(15, 2), allowNull: true },
            approval_status:        { type: DataTypes.ENUM('En attente', 'approved', 'rejected'), defaultValue: 'En attente' },
            is_flash_sale:          { type: DataTypes.BOOLEAN,  defaultValue: false },
            flash_sale_end:         { type: DataTypes.DATE,     allowNull: true },
        },
        boutiques: {
            momo_number:        { type: DataTypes.STRING, allowNull: true },
            whatsapp:           { type: DataTypes.STRING, allowNull: true },
            lat:                { type: DataTypes.DECIMAL(10, 8), allowNull: true },
            lng:                { type: DataTypes.DECIMAL(11, 8), allowNull: true },
            departement_id:     { type: DataTypes.STRING, allowNull: true },
            departement_label:  { type: DataTypes.STRING, allowNull: true },
            commune_id:         { type: DataTypes.STRING, allowNull: true },
            commune_label:      { type: DataTypes.STRING, allowNull: true },
            quartier_id:        { type: DataTypes.STRING, allowNull: true },
            quartier_label:     { type: DataTypes.STRING, allowNull: true },
        },
        cart_items: {
            price_snapshot:      { type: DataTypes.DECIMAL(15, 2), allowNull: true },
            image_url:           { type: DataTypes.TEXT, allowNull: true },
            selected_attributes: { type: DataTypes.JSON, defaultValue: {} },
            variant_id:          { type: DataTypes.CHAR(36), allowNull: true },
        },
        supplier_products: {
            approval_status: { type: DataTypes.ENUM('En attente', 'approved', 'rejected'), defaultValue: 'En attente' },
            admin_feedback:  { type: DataTypes.TEXT('long'), allowNull: true },
            available:       { type: DataTypes.BOOLEAN, defaultValue: true },
            variant_id:      { type: DataTypes.CHAR(36), allowNull: true },
        },
        product_variant_prices: {
            image_url:  { type: DataTypes.TEXT, allowNull: true },
            old_price:  { type: DataTypes.DECIMAL(15, 2), allowNull: true },
        },
        products_: { /* placeholder */ }
    };

    // Pour chaque table et chaque colonne attendue
    for (const [table, columns] of Object.entries(schema)) {
        if (table === 'products_') continue; // skip placeholder

        // Récupérer les colonnes existantes en DB
        let existingCols = [];
        try {
            const [rows] = await sequelize.query(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '${table}'
            `);
            existingCols = rows.map(r => r.COLUMN_NAME);
        } catch (e) {
            results.errors.push(`Impossible de lire les colonnes de ${table}: ${e.message}`);
            continue;
        }

        for (const [colName, colDef] of Object.entries(columns)) {
            if (existingCols.includes(colName)) {
                results.skipped.push(`${table}.${colName}`);
                continue;
            }

            try {
                await qi.addColumn(table, colName, colDef);
                results.added.push(`${table}.${colName}`);
                console.log(`[sync-db] ✅ Ajout: ${table}.${colName}`);
            } catch (err) {
                results.errors.push(`${table}.${colName}: ${err.message}`);
                console.error(`[sync-db] ❌ Erreur: ${table}.${colName} —`, err.message);
            }
        }
    }

    const status = results.errors.length > 0 ? 207 : 200;
    res.status(status).json({
        message: results.errors.length === 0
            ? '✅ Synchronisation complète sans erreur'
            : '⚠️ Synchronisation terminée avec des avertissements',
        added:   results.added,
        skipped: results.skipped,
        errors:  results.errors,
    });
};
