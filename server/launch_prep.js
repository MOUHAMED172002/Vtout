/**
 * ========================================================
 * SCRIPT DE PRÉPARATION AU LANCEMENT — VTOUT
 * ========================================================
 * Ce script vide la base de données des données de test,
 * en conservant :
 *   - Le compte Admin
 *   - Les catégories, attributs, géographie
 * 
 * Et supprime :
 *   - Toutes les commandes (orders, order_items)
 *   - Tous les paniers (carts, cart_items)
 *   - Toutes les transactions financières
 *   - Tous les messages de support
 *   - Tous les avis clients
 *   - Toutes les demandes de retrait
 *   - Toutes les notifications
 *   - Les comptes non-admin (fournisseurs, livreurs, clients)
 *   - Les boutiques, adresses, livreurs, fournisseurs
 * ========================================================
 */

import { readFileSync, existsSync } from 'fs';
import { createConnection } from 'mysql2/promise';
import * as readline from 'readline/promises';
import { join } from 'path';

// Détecter le chemin du .env (soit à la racine, soit dans /server)
let envPath = './.env';
if (!existsSync(envPath)) {
    envPath = './server/.env';
}
if (!existsSync(envPath)) {
    envPath = '../server/.env';
}

if (!existsSync(envPath)) {
    throw new Error('❌ Fichier .env introuvable. Assurez-vous d\'être à la racine du projet ou dans le dossier server.');
}

const envText = readFileSync(envPath, 'utf-8');
const envVars = {};
for (const line of envText.split('\n')) {
    const clean = line.trim();
    if (!clean || clean.startsWith('#')) continue;
    const eqIdx = clean.indexOf('=');
    if (eqIdx < 0) continue;
    envVars[clean.slice(0, eqIdx).trim()] = clean.slice(eqIdx + 1).trim();
}

const databaseUrl = envVars['MYSQL_DATABASE_URL'] || envVars['DATABASE_URL'];
if (!databaseUrl) throw new Error('❌ MYSQL_DATABASE_URL non trouvée dans le .env');

// Utilisation de l'API URL pour un parsing robuste (gère les caractères spéciaux dans le mot de passe)
let dbConfig;
try {
    const url = new URL(databaseUrl);
    dbConfig = {
        host: url.hostname,
        port: parseInt(url.port) || 3306,
        user: url.username,
        password: url.password,
        database: url.pathname.slice(1)
    };
} catch (e) {
    throw new Error('❌ Format de MYSQL_DATABASE_URL invalide (doit être mysql://user:pass@host:port/db)');
}

async function run() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀  VTOUT — PRÉPARATION AU LANCEMENT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  Cette opération est IRRÉVERSIBLE.');
    console.log('   Elle supprimera toutes les données de test.');
    console.log('   Le compte admin sera conservé.\n');
    
    const answer = await rl.question('   Tapez "LANCER" pour confirmer : ');
    rl.close();
    
    if (answer.trim() !== 'LANCER') {
        console.log('\n❌ Opération annulée.\n');
        return;
    }

    const conn = await createConnection(dbConfig);
    console.log('\n✅ Connecté à la base de données.\n');

    try {
        // Trouver l'admin
        const [admins] = await conn.query(`SELECT id, email FROM profiles WHERE role = 'admin' LIMIT 1`);
        if (admins.length === 0) {
            console.error('❌ Aucun compte admin trouvé ! Abandon par sécurité.');
            return;
        }
        const admin = admins[0];
        console.log(`👑 Admin conservé : ${admin.email}`);

        // Désactiver les FK
        await conn.query('SET FOREIGN_KEY_CHECKS = 0;');

        // Tables à vider complètement
        const tablesToEmpty = [
            'order_items',
            'orders',
            'financial_transactions',
            'payout_requests',
            'cart_items',
            'carts',
            'support_messages',
            'reviews',
            'disputes',
            'notifications',
            'favorites',
            'delivery_persons',
            'boutiques',
            'addresses',
            'coupon_usages',
            'product_variant_prices',
            'product_variants',
            'product_images',
            'products',
        ];

        for (const table of tablesToEmpty) {
            try {
                const [result] = await conn.query(`DELETE FROM \`${table}\``);
                console.log(`   🧹 ${table}: ${result.affectedRows} entrées supprimées`);
            } catch (e) {
                if (e.code === 'ER_NO_SUCH_TABLE') {
                    console.log(`   ⚪ ${table}: table inexistante (ignoré)`);
                } else {
                    console.warn(`   ⚠️  ${table}: ${e.message}`);
                }
            }
        }

        // Supprimer les fournisseurs et leurs liens produits
        await conn.query('DELETE FROM supplier_products');
        const [supplierResult] = await conn.query('DELETE FROM suppliers');
        console.log(`   🧹 suppliers: ${supplierResult.affectedRows} supprimés`);

        // Supprimer les profils non-admin
        const [profileResult] = await conn.query(`DELETE FROM profiles WHERE role != 'admin'`);
        console.log(`   🧹 profiles: ${profileResult.affectedRows} comptes tests supprimés`);

        // Supprimer les sessions Better Auth (garder celle de l'admin)
        try {
            const [sessResult] = await conn.query(`DELETE FROM session WHERE userId != ?`, [admin.id]);
            const [accResult] = await conn.query(`DELETE FROM account WHERE userId != ?`, [admin.id]);
            const [userResult] = await conn.query(`DELETE FROM user WHERE id != ?`, [admin.id]);
            console.log(`   🧹 auth sessions/accounts: ${sessResult.affectedRows + accResult.affectedRows + userResult.affectedRows} entrées supprimées`);
        } catch (e) {
            // Better Auth peut utiliser des noms de tables différents
            console.log(`   ⚪ Tables auth Better Auth: ${e.message}`);
        }

        // Réactiver les FK
        await conn.query('SET FOREIGN_KEY_CHECKS = 1;');

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅  BASE DE DONNÉES PRÊTE POUR LE LANCEMENT !');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (err) {
        await conn.query('SET FOREIGN_KEY_CHECKS = 1;').catch(() => {});
        console.error('\n❌ ERREUR CRITIQUE:', err.message);
    } finally {
        await conn.end();
    }
}

run().catch(console.error);
