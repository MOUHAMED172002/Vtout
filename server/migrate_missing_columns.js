/**
 * migrate_missing_columns.js
 * Ajoute les colonnes manquantes à la base de données en production.
 * Lancer avec: node migrate_missing_columns.js
 */
import 'dotenv/config';
import sequelize from './config/database.js';

const migrations = [
    // Table: products
    {
        table: 'products',
        column: 'boutique_id',
        sql: `ALTER TABLE products ADD COLUMN boutique_id CHAR(36) NULL REFERENCES boutiques(id) ON DELETE SET NULL`
    },
    {
        table: 'products',
        column: 'secondary_boutique_ids',
        sql: `ALTER TABLE products ADD COLUMN secondary_boutique_ids JSON NULL`
    },
    {
        table: 'products',
        column: 'supplier_note',
        sql: `ALTER TABLE products ADD COLUMN supplier_note LONGTEXT NULL`
    },
    {
        table: 'products',
        column: 'in_stock_supplier',
        sql: `ALTER TABLE products ADD COLUMN in_stock_supplier TINYINT(1) NOT NULL DEFAULT 1`
    },
    {
        table: 'products',
        column: 'admin_feedback',
        sql: `ALTER TABLE products ADD COLUMN admin_feedback LONGTEXT NULL`
    },
    // Table: boutiques (cas où elle n'existe pas)
    {
        table: 'boutiques',
        column: 'momo_number',
        sql: `ALTER TABLE boutiques ADD COLUMN momo_number VARCHAR(255) NULL`
    },
    {
        table: 'boutiques',
        column: 'whatsapp',
        sql: `ALTER TABLE boutiques ADD COLUMN whatsapp VARCHAR(255) NULL`
    },
    {
        table: 'financial_transactions',
        column: 'source',
        sql: `ALTER TABLE financial_transactions ADD COLUMN source VARCHAR(255) NULL`
    },
];

async function columnExists(table, column) {
    try {
        const [rows] = await sequelize.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
              AND TABLE_NAME = '${table}' 
              AND COLUMN_NAME = '${column}'
        `);
        return rows.length > 0;
    } catch (e) {
        return false;
    }
}

async function run() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connexion DB OK\n');

        for (const m of migrations) {
            const exists = await columnExists(m.table, m.column);
            if (exists) {
                console.log(`⏭️  SKIP: ${m.table}.${m.column} (déjà présente)`);
            } else {
                try {
                    await sequelize.query(m.sql);
                    console.log(`✅ AJOUT: ${m.table}.${m.column}`);
                } catch (err) {
                    console.error(`❌ ERREUR sur ${m.table}.${m.column}:`, err.message);
                }
            }
        }

        console.log('\n✅ Migration terminée.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Connexion DB impossible:', err.message);
        process.exit(1);
    }
}

run();
