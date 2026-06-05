import "dotenv/config";
import { errorHandler } from './middleware/errorHandler.js';
console.log("=== SERVER STARTING ===");
console.log("NODE_ENV:", process.env.NODE_ENV);
import fs from "fs";





// --- VALIDATION ENV ---
const requiredEnv = [
    'MYSQL_DATABASE_URL',
    'BETTER_AUTH_SECRET',
    'BETTER_AUTH_URL',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'FEDAPAY_WEBHOOK_SECRET'
];

const missingEnv = requiredEnv.filter(env => !process.env[env]);
const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
    console.log = () => {};
    console.debug = () => {};
}

if (missingEnv.length > 0 && process.env.NODE_ENV === 'production') {
    console.error(`[FATAL] Variables d'environnement manquantes : ${missingEnv.join(', ')}`);
    // process.exit(1); // On commente pour voir les logs même s'il manque des choses
}

console.log(">>> [BOOT] Server execution started");
console.log(">>> [BOOT] Env: PORT=" + (process.env.PORT || 3000));
console.log(">>> [BOOT] Database URL defined:", !!process.env.MYSQL_DATABASE_URL);

import express from "express";
import cors from "cors";
import http from 'http';
import { Server } from 'socket.io';
import { applySecurity } from "./middleware/securityMiddleware.js";

console.log(">>> [BOOT] Loading Sequelize/Models...");
import { sequelize } from "./models/index.js";
console.log(">>> [BOOT] Models loaded.");

import { authMiddleware, betterAuthMiddleware, requireAuth, requireAdmin } from "./middleware/authMiddleware.js";

// Routes
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import attributeRoutes from "./routes/attributeRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import policyRoutes from "./routes/policyRoutes.js";
import configRoutes from "./routes/configRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import financialRoutes from "./routes/financialRoutes.js";
import authWhatsAppRoutes from "./routes/authWhatsAppRoutes.js";
import verifyEmailRoutes from "./routes/verifyEmailRoutes.js";
import resendVerificationRoutes from "./routes/resendVerificationRoutes.js";

import paymentRoutes from "./routes/paymentRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import seedBlogs from "./seedBlogs.js";
import { adminSyncFinancials } from "./controllers/financialController.js";
import { syncDatabase } from "./controllers/migrationController.js";
import { Config, SupportMessage } from "./models/index.js";
import { runMasterSeed } from "./masterSeed.js";
import { processAbandonedCarts } from "./services/abandonedCartService.js";
import { processReviewReminders } from "./services/reviewReminderService.js";
import { processReengagement, processVipMessages } from "./services/reengagementService.js";

// --- BACKGROUND JOBS ---
const startJobs = () => {
    console.log("⏰ [JOBS] Démarrage des tâches de fond...");

    // Relance des paniers abandonnés (toutes les heures)
    setInterval(() => {
        processAbandonedCarts().catch(err => console.error("[JOB ERROR] Abandoned Carts:", err));
    }, 60 * 60 * 1000);

    // Relances avis post-livraison (toutes les 24h)
    setInterval(() => {
        processReviewReminders().catch(err => console.error("[JOB ERROR] Review Reminders:", err));
    }, 24 * 60 * 60 * 1000);

    // Réengagement clients inactifs (tous les 7 jours)
    setInterval(() => {
        processReengagement().catch(err => console.error("[JOB ERROR] Reengagement:", err));
    }, 7 * 24 * 60 * 60 * 1000);

    // Messages clients VIP (tous les 30 jours)
    setInterval(() => {
        processVipMessages().catch(err => console.error("[JOB ERROR] VIP Messages:", err));
    }, 30 * 24 * 60 * 60 * 1000);

    // Premiers passages 1 minute après le démarrage
    setTimeout(() => {
        processAbandonedCarts().catch(err => console.error("[JOB ERROR] Abandoned Carts (Initial):", err));
        processReviewReminders().catch(err => console.error("[JOB ERROR] Review Reminders (Initial):", err));
    }, 60 * 1000);
};

// Webhooks & Special routes
import createFedapay from "./api/create-fedapay.js";
import fedapayWebhook from "./api/fedapay-webhook.js";

const app = express();
app.set('trust proxy', 1); // Indispensable pour Dokploy/Traefik

process.on('uncaughtException', (err) => {
    console.error('[FATAL] Uncaught Exception:', err.message);
    // Ne pas quitter sur ECONNRESET (reconnexion DB) — juste logger
    if (err.code === 'ECONNRESET' || err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.warn('[DB] Connection reset — pool will reconnect automatically.');
        return;
    }
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    console.error('[WARN] Unhandled Rejection:', reason?.message || reason);
    // Ne pas crasher — juste alerter
});

// --- GRACEFUL SHUTDOWN ---
// Libère le port proprement à chaque SIGTERM/SIGINT (nodemon, Ctrl+C, PM2)
const gracefulShutdown = (signal) => {
    console.log(`\n[SHUTDOWN] Signal ${signal} reçu. Fermeture propre...`);
    server.close(async () => {
        console.log('[SHUTDOWN] Serveur HTTP fermé.');
        try {
            await sequelize.close();
            console.log('[SHUTDOWN] Pool DB fermé.');
        } catch (e) {
            console.warn('[SHUTDOWN] Erreur fermeture DB:', e.message);
        }
        process.exit(0);
    });
    // Forcer la sortie après 10s si le shutdown traîne
    setTimeout(() => {
        console.error('[SHUTDOWN] Timeout — forçage de la sortie.');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Dev ports that we run Vite on
const DEV_PORTS = [5173, 5174, 5175, 5176, 5177];

const isAllowedOrigin = (origin) => {
    if (!origin) return true; 

    try {
        const url = new URL(origin);
        const hostname = url.hostname;
        const port = parseInt(url.port, 10);

        // Autoriser localhost et IPs privées pour le dev
        if (hostname === 'localhost' || hostname === '127.0.0.1') return true;

        const isPrivateIP =
            /^10\./.test(hostname) ||
            /^192\.168\./.test(hostname) ||
            /^172\.(1[6-9]|2\d|3[01])\./.test(hostname);

        if (isPrivateIP && DEV_PORTS.includes(port)) return true;

        // Autoriser tous les sous-domaines de vtout.com en production
        if (hostname.endsWith('.vtout.com') || hostname === 'vtout.com') return true;

        // Liste explicite depuis .env
        const explicit = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);
        const extra = (process.env.EXTRA_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);
        const allAllowed = [...explicit, ...extra];
        
        return allAllowed.includes(origin);
    } catch {
        return false;
    }
};

const corsOptions = {
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
            callback(null, true);
        } else {
            console.warn(`[CORS] Blocked origin: ${origin}`);
            callback(new Error(`CORS: origin ${origin} not allowed`));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-fedapay-signature'],
    credentials: true,
};

app.use(cors(corsOptions));
applySecurity(app);

// --- REQUEST LOGGER (Moved to top) ---
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    next();
});

// Attach Socket.io to requests
app.use((req, res, next) => {
    req.io = io;
    next();
});

const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10kb' }));

// 🆘 ROUTE DE SECOURS - À UTILISER SI LES ERREURS 500 PERSISTENT
app.get("/api/repair-db", async (req, res) => {
    try {
        const logs = [];
        const { Otp, Config, Profile, sequelize } = await import('./models/index.js');
        const qi = sequelize.getQueryInterface();
        const { DataTypes } = await import('sequelize');

        logs.push("🚀 Démarrage de la réparation forcée...");

        // 1. Sync Otp table explicitly
        try {
            await Otp.sync({ alter: true });
            logs.push("✅ Table 'otps' synchronisée.");
        } catch (e) {
            logs.push("❌ Erreur table otps : " + e.message);
        }

        // 2. Add missing columns to existing tables
        const columns = [
            { table: 'categories', col: 'commission_rate', def: { type: DataTypes.DECIMAL(5, 2), allowNull: true } },
            { table: 'orders', col: 'dispute_status', def: { type: DataTypes.STRING(30), allowNull: true } },
            { table: 'orders', col: 'is_parent', def: { type: DataTypes.BOOLEAN, defaultValue: false } },
            { table: 'orders', col: 'parent_id', def: { type: DataTypes.CHAR(36), allowNull: true } },
            { table: 'orders', col: 'whatsapp_notif_phone', def: { type: DataTypes.STRING(30), allowNull: true } },
            { table: 'delivery_persons', col: 'whatsapp', def: { type: DataTypes.STRING(30), allowNull: true } },
            { table: 'orders', col: 'boutique_id', def: { type: DataTypes.CHAR(36), allowNull: true } },
            { table: 'orders', col: 'supplier_id', def: { type: DataTypes.CHAR(36), allowNull: true } },
            { table: 'order_items', col: 'boutique_id', def: { type: DataTypes.CHAR(36), allowNull: true } },
            { table: 'support_messages', col: 'order_id', def: { type: DataTypes.CHAR(36), allowNull: true } },
            { table: 'support_messages', col: 'type', def: { type: DataTypes.STRING(20), defaultValue: 'message' } },
            { table: 'products', col: 'is_kit', def: { type: DataTypes.BOOLEAN, defaultValue: false } },
            { table: 'products', col: 'kit_items', def: { type: DataTypes.TEXT, allowNull: true } },
            { table: 'products', col: 'volume_pricing', def: { type: DataTypes.TEXT, allowNull: true } },
            { table: 'financial_transactions', col: 'source', def: { type: DataTypes.STRING(32), allowNull: true } }
        ];

        for (const c of columns) {
            try {
                await qi.addColumn(c.table, c.col, c.def);
                logs.push(`✅ Ajouté : ${c.table}.${c.col}`);
            } catch (e) {
                logs.push(`ℹ️ Ignoré/Existe déjà : ${c.table}.${c.col}`);
            }
        }

        // 3. Test de connexion finale
        await sequelize.authenticate();
        logs.push("✅ Connexion base de données : OK");

        res.json({ 
            message: "Réparation terminée. Si les erreurs 500 persistent, vérifiez les logs du serveur.", 
            details: logs 
        });
    } catch (error) {
        console.error("[REPAIR ERROR]", error);
        res.status(500).json({ error: error.message, stack: error.stack });
    }
});

// ROUTE DE DIAGNOSTIC PUBLIC POUR DOKPLOY
app.get("/api/diagnostics", async (req, res) => {
    const { key, action, orderId, userId } = req.query;
    if (key !== "MouhmedDiagnostics2026") {
        return res.status(403).json({ error: "Clé secrète de diagnostic invalide ou manquante." });
    }

    const report = {
        timestamp: new Date().toISOString(),
        database: "unknown",
        errors: [],
        data: {}
    };

    try {
        const { Profile, Supplier, FinancialTransaction, Order, sequelize, User } = await import('./models/index.js');
        
        // 1. Connexion DB
        try {
            await sequelize.authenticate();
            report.database = "CONNECTED";
        } catch (dbErr) {
            report.database = "CONNECTION_FAILED";
            report.errors.push("DB Connection error: " + dbErr.message);
            return res.status(500).json(report);
        }

        // Action: sync-role (Manuellement forcer le rôle de fournisseur)
        if (action === "sync-role" && userId) {
            report.data.syncResult = {};
            try {
                const profile = await Profile.findByPk(userId);
                const userRow = await User.findByPk(userId);
                if (profile) {
                    await profile.update({ role: 'fournisseur' });
                    report.data.syncResult.profileUpdated = "fournisseur";
                }
                if (userRow) {
                    await userRow.update({ role: 'fournisseur' });
                    report.data.syncResult.userTableUpdated = "fournisseur";
                }
                await sequelize.query(
                    'UPDATE user SET role = :role WHERE id = :id',
                    {
                        replacements: { role: 'fournisseur', id: userId },
                        type: sequelize.QueryTypes.UPDATE
                    }
                );
                report.data.syncResult.rawSqlRun = true;
            } catch (err) {
                report.errors.push("Sync-role action failed: " + err.message);
            }
            return res.json(report);
        }

        // Action: process-financials (Forcer le traitement financier d'une commande)
        if (action === "process-financials" && orderId) {
            report.data.financialsResult = {};
            try {
                const { processOrderFinancials } = await import('./services/financialService.js');
                await processOrderFinancials(orderId);
                report.data.financialsResult.success = true;
            } catch (finErr) {
                report.data.financialsResult.success = false;
                report.data.financialsResult.error = finErr.message;
                report.errors.push("processOrderFinancials error: " + finErr.message);
            }
            return res.json(report);
        }

        // 2. Rôles dans Profile
        try {
            const profileRoles = await Profile.findAll({
                attributes: ['role', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
                group: ['role'],
                raw: true
            });
            report.data.profileRoles = profileRoles;
        } catch (e) {
            report.errors.push("Error querying profile roles: " + e.message);
        }

        // 3. Rôles dans la table user
        try {
            const userTableRoles = await sequelize.query("SELECT role, COUNT(id) as count FROM user GROUP BY role", {
                type: sequelize.QueryTypes.SELECT
            });
            report.data.userTableRoles = userTableRoles;
        } catch (e) {
            report.errors.push("Error querying user table roles: " + e.message);
        }

        // 4. Derniers fournisseurs
        try {
            const lastSuppliers = await Supplier.findAll({
                limit: 5,
                order: [['created_at', 'DESC']],
                include: [{ model: Profile, as: 'user', attributes: ['id', 'email', 'role'] }]
            });
            report.data.lastSuppliers = lastSuppliers.map(s => ({
                id: s.id,
                name: s.name,
                status: s.status,
                user_id: s.user_id,
                profileRole: s.user?.role,
                profileEmail: s.user?.email
            }));
        } catch (e) {
            report.errors.push("Error querying suppliers: " + e.message);
        }

        // 5. Query delivery persons and transactions for delivery person id 5
        try {
            const dps = await sequelize.query(`
                SELECT id, user_id, is_verified FROM delivery_persons
            `, { type: sequelize.QueryTypes.SELECT });
            
            const txs = await sequelize.query(`
                SELECT id, order_id, user_id, type, amount, description, source, status, created_at
                FROM financial_transactions
                WHERE user_id = (SELECT user_id FROM delivery_persons WHERE id = 5)
                ORDER BY created_at DESC
            `, { type: sequelize.QueryTypes.SELECT });
            
            report.data.rawGainsResult = { dps, txs };
        } catch (e) {
            report.errors.push("Error querying raw gains: " + e.message);
        }

        // 6. Dernières commandes
        try {
            const lastOrders = await Order.findAll({
                limit: 10,
                order: [['created_at', 'DESC']],
                attributes: ['id', 'status', 'total_amount', 'supplier_id', 'delivery_person_id', 'payment_status']
            });
            report.data.lastOrders = lastOrders;
        } catch (e) {
            report.errors.push("Error querying last orders: " + e.message);
        }

        res.json(report);

    } catch (criticalErr) {
        report.errors.push("Critical diagnostics error: " + criticalErr.message);
        res.status(500).json(report);
    }
});

app.use("/api/auth/whatsapp", authWhatsAppRoutes);
app.use("/api/auth", betterAuthMiddleware);

// Redirection du lien de réinitialisation du backend vers le frontend
app.get("/reset-password", (req, res) => {
    const token = req.query.token;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/reset-password?token=${token}`);
});

// Email verification — public route (no auth required)
app.use("/api/verify-email", verifyEmailRoutes);

// Fallback pour les anciens liens avec double /api/api/
app.use("/api/api", (req, res) => {
    const target = req.originalUrl.replace("/api/api/", "/api/");
    res.redirect(307, target);
});

app.use(authMiddleware);

app.use("/api/create-fedapay", createFedapay);
app.use("/api/fedapay-webhook", fedapayWebhook);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use('/api/attributes', attributeRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/configs", configRoutes);
app.use("/api/config", configRoutes);
app.use("/api/locations", locationRoutes);


app.use("/api/support", supportRoutes);
app.use("/api/financials", financialRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/resend-verification", resendVerificationRoutes);

// Emergency Sync Route
app.get("/api/emergency-sync", requireAuth, requireAdmin, adminSyncFinancials);

// Database Migration Route — admin only, safe to call multiple times
app.post("/api/admin/sync-db", requireAuth, requireAdmin, syncDatabase);

// Centralized secure error handler (must be last middleware)
app.use(errorHandler);


app.get("/", (req, res) => res.send("Vtout API — Online"));
app.get("/favicon.ico", (req, res) => res.status(204).end());

// Health check pour les moniteurs de disponibilité (UptimeRobot, etc.)
app.get("/api/health", async (req, res) => {
    try {
        await sequelize.authenticate();
        res.json({ status: 'ok', db: 'connected', uptime: process.uptime().toFixed(0) + 's', ts: new Date().toISOString() });
    } catch {
        res.status(503).json({ status: 'degraded', db: 'disconnected' });
    }
});

// 🔍 Diagnostic public — retourne l'erreur SQL exacte pour identifier les colonnes manquantes
// À SUPPRIMER après débogage
app.get("/api/diag", async (req, res) => {
    const results = {};
    // Test 1: products
    try {
        await sequelize.query('SELECT id, name, price, approval_status, supplier_price, in_stock_supplier, boutique_id, secondary_boutique_ids, supplier_note FROM products LIMIT 1');
        results.products = 'OK';
    } catch (e) { 
        results.products = e.message; 
        // 🛠️ TENTATIVE DE FIX AUTOMATIQUE
        if (e.message.includes('secondary_boutique_ids')) {
            try {
                await sequelize.query("ALTER TABLE products ADD COLUMN secondary_boutique_ids TEXT NULL");
                results.auto_fix_attempt = "✅ Colonne 'secondary_boutique_ids' ajoutée avec succès. Rafraîchissez la page !";
            } catch (fixErr) {
                results.auto_fix_attempt = "❌ Échec du fix: " + fixErr.message;
            }
        }
    }

    // Test 2: boutiques
    try {
        await sequelize.query('SELECT id, name, phone, whatsapp, momo_number, departement_id, departement_label, commune_id, commune_label, quartier_id, quartier_label FROM boutiques LIMIT 1');
        results.boutiques = 'OK';
    } catch (e) { results.boutiques = e.message; }

    // Test 3: cart_items
    try {
        await sequelize.query('SELECT id, user_id, product_id, variant_id, quantity, price_snapshot, image_url, selected_attributes FROM cart_items LIMIT 1');
        results.cart_items = 'OK';
    } catch (e) { results.cart_items = e.message; }

    // Test 4: supplier_products
    try {
        await sequelize.query('SELECT id, supplier_id, product_id, variant_id, supplier_price, available, approval_status, admin_feedback FROM supplier_products LIMIT 1');
        results.supplier_products = 'OK';
    } catch (e) { results.supplier_products = e.message; }

    // Test 5: product_variant_prices
    try {
        await sequelize.query('SELECT id, variant_id, price, old_price, stock, image_url FROM product_variant_prices LIMIT 1');
        results.product_variant_prices = 'OK';
    } catch (e) { results.product_variant_prices = e.message; }

    // Test 6: suppliers
    try {
        await sequelize.query('SELECT id, name, phone, whatsapp, momo_number, status, terms_accepted, electronic_signature, departement_id, departement_label, commune_id, commune_label, quartier_id, quartier_label, lat, lng FROM suppliers LIMIT 1');
        results.suppliers = 'OK';
    } catch (e) { results.suppliers = e.message; }

    // 📊 Statistiques de données
    try {
        const [boutiqueCount] = await sequelize.query('SELECT COUNT(*) as count FROM boutiques');
        const [supplierCount] = await sequelize.query('SELECT COUNT(*) as count FROM suppliers');
        const [suppliers] = await sequelize.query('SELECT id, name, user_id FROM suppliers');
        const [boutiques] = await sequelize.query('SELECT id, name, supplier_id FROM boutiques');
        
        results.stats = {
            total_boutiques: boutiqueCount[0].count,
            total_suppliers: supplierCount[0].count,
            suppliers: suppliers,
            boutiques: boutiques
        };

        // 🛠️ TENTATIVE DE RÉPARATION DES LIENS (Si demandé via ?fixBoutiques=true)
        if (req.query.fixBoutiques === 'true') {
            results.repair_log = [];
            for (const b of boutiques) {
                // Chercher un fournisseur qui a exactement le même nom que la boutique
                const matchingSupplier = suppliers.find(s => s.name === b.name);
                if (matchingSupplier && b.supplier_id !== matchingSupplier.id) {
                    await sequelize.query(`UPDATE boutiques SET supplier_id = '${matchingSupplier.id}' WHERE id = '${b.id}'`);
                    results.repair_log.push(`✅ Boutique "${b.name}" ré-attachée au fournisseur "${matchingSupplier.name}"`);
                }
            }
            if (results.repair_log.length === 0) results.repair_log.push("Rien à réparer (noms non concordants ou déjà liés).");
        }

    } catch (e) { results.stats_error = e.message; }

    res.json(results);
});

const server = http.createServer(app);
const io = new Server(server, { 
    cors: {
        origin: (origin, callback) => {
            if (!origin || isAllowedOrigin(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on('connection', (socket) => {
    socket.on('join', (userId) => socket.join(userId));
    socket.on('driver_location', (data) => {
        if (data.orderId) {
            io.emit(`order_update_${data.orderId}`, data);
        }
        io.emit('admin_driver_update', data);
    });

    socket.on('send_message', async (data) => {
        try {
            const { sender_id, receiver_id, content, conversation_id, attachment_url } = data;
            console.log(`[Socket] Message received from ${sender_id} for conv ${conversation_id}`);
            const message = await SupportMessage.create({
                sender_id,
                receiver_id: receiver_id || null,
                content,
                conversation_id: conversation_id || `${sender_id}_admin`,
                attachment_url
            });

            // Broadcast to the specifically targeted receiver and back to the sender
            if (receiver_id) {
                io.to(receiver_id).emit('new_message', message);
            }
            // If it's a message for admin, notify admins
            if (conversation_id?.endsWith('_admin')) {
                io.to('admins').emit('new_message', message);
            }
            
            // Send back confirm to sender (if they are in their own room)
            io.to(sender_id).emit('new_message', message);

        } catch (error) {
            console.error('[Socket] Error saving message:', error.message);
        }
    });
});

// Note: The global errorHandler is already registered at line 330
// and will handle all errors from the routes above.

const startServer = () => {
    // Timeout global sur les requêtes HTTP (25s) — évite les connexions bloquantes
    server.timeout = 25000;
    server.keepAliveTimeout = 65000; // > 60s (timeout load balancer Nginx par défaut)
    server.headersTimeout = 66000;

    server.listen(PORT, '0.0.0.0', () => {
        console.log(`✅ Vtout API running on http://localhost:${PORT}`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`[FATAL] Port ${PORT} déjà utilisé. Lancez: netstat -ano | findstr :${PORT} puis taskkill /PID <pid> /F`);
        } else {
            console.error('[FATAL] Server error:', err.message);
        }
        process.exit(1);
    });
};

import { startDisputeCron } from './services/disputeCronService.js';

// --- STARTUP LOGIC ---
console.log("🚀 [BOOT] Starting Vtout API...");
console.log(">>> [BOOT] Configured ALLOWED_ORIGINS:", process.env.ALLOWED_ORIGINS);

// Start HTTP server immediately so port 3000 is open
startServer();
startDisputeCron();

// Initialize Database in background
console.log("💾 [BOOT] Connecting to Database...");
sequelize.authenticate()
    .then(async () => {
        console.log("✅ [DB] Database connected");
        console.log(">>> [BOOT] Syncing database...");
        
        try {
            // En production, on désactive alter:true par défaut pour éviter de corrompre les index
            // ou de dépasser la limite de 64 clés de MySQL lors de redémarrages fréquents.
            const syncOptions = isProd ? { alter: false } : { alter: true };
            await sequelize.sync(syncOptions);

            // Ensure `financial_transactions.source` exists, even if the migration was skipped previously.
            try {
                const [sourceColRows] = await sequelize.query(`
                    SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'financial_transactions' AND COLUMN_NAME = 'source'
                `);
                if (!sourceColRows || sourceColRows.length === 0) {
                    await sequelize.query(`ALTER TABLE financial_transactions ADD COLUMN source VARCHAR(255) NULL`);
                    console.log('  ✅ [MIGRATION] Added missing financial_transactions.source via raw SQL');
                }
            } catch (sourceCheckErr) {
                console.warn('  ⚠️ [MIGRATION] Could not ensure financial_transactions.source:', sourceCheckErr.message);
            }

            // Ensure `order_items.original_price` exists (used by orderController for discount tracking).
            try {
                await sequelize.query(`ALTER TABLE order_items ADD COLUMN original_price DECIMAL(15,2) NULL`);
                console.log('  ✅ [MIGRATION] Added order_items.original_price');
            } catch (opErr) {
                if (!opErr.message.includes('Duplicate column')) {
                    console.warn('  ⚠️ [MIGRATION] order_items.original_price:', opErr.message);
                }
            }

            // Dispute protocol v2 — motif + photo_url columns
            for (const [tbl, col, def] of [
                ['disputes', 'motif',     'VARCHAR(100) NULL'],
                ['disputes', 'photo_url', 'TEXT NULL'],
            ]) {
                try {
                    await sequelize.query(`ALTER TABLE \`${tbl}\` ADD COLUMN \`${col}\` ${def}`);
                    console.log(`  ✅ [MIGRATION] Added ${tbl}.${col}`);
                } catch (e) {
                    if (!e.message.includes('Duplicate column')) console.warn(`  ⚠️ ${tbl}.${col}:`, e.message);
                }
            }

            // Make disputes.description nullable (previously NOT NULL)
            try {
                await sequelize.query(`ALTER TABLE disputes MODIFY COLUMN description TEXT NULL`);
            } catch (e) { /* ignore */ }

            // ── Fix charset tables: convert all text-heavy tables to utf8mb4 ──
            // Fixes French accents (é, è, à, ç...) showing as ? in dashboard, toasts, notifications.
            // Tables created without explicit charset default to server charset which may be latin1/utf8.
            try {
                const tablesToConvert = [
                    'notifications', 'orders', 'order_items', 'products', 'product_images',
                    'product_variants', 'product_variant_prices', 'categories',
                    'financial_transactions', 'support_messages', 'blogs',
                    'boutiques', 'suppliers', 'profiles', 'configs',
                    'cart_items', 'delivery_persons',
                ];
                for (const tbl of tablesToConvert) {
                    try {
                        const [charsetRows] = await sequelize.query(`
                            SELECT CCSA.character_set_name
                            FROM information_schema.TABLES T
                            JOIN information_schema.COLLATION_CHARACTER_SET_APPLICABILITY CCSA
                              ON CCSA.collation_name = T.table_collation
                            WHERE T.table_schema = DATABASE() AND T.table_name = '${tbl}'
                        `);
                        const currentCharset = charsetRows?.[0]?.character_set_name;
                        if (currentCharset && currentCharset !== 'utf8mb4') {
                            await sequelize.query(`ALTER TABLE \`${tbl}\` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
                            console.log(`  ✅ [CHARSET] Converted ${tbl} from ${currentCharset} → utf8mb4`);
                        }
                    } catch (tblErr) {
                        console.warn(`  ⚠️ [CHARSET] Could not convert ${tbl}: ${tblErr.message}`);
                    }
                }
                console.log('✅ [CHARSET] Table charset check complete.');
            } catch (charsetErr) {
                console.warn('  ⚠️ [CHARSET] Table charset migration failed:', charsetErr.message);
            }

            // ── Migration automatique des colonnes manquantes ──
            // Cette fonction est idempotente (safe à appeler plusieurs fois)
            try {
                console.log("🛠️ [MIGRATION] Running safe column migrations...");
                const qi = sequelize.getQueryInterface();
                const { DataTypes } = await import('sequelize');

                // ── FORCAGE SQL BRUT (Pour MySQL < 5.7 qui ne supporte pas JSON) ──
                try {
                    await sequelize.query("ALTER TABLE products ADD COLUMN secondary_boutique_ids TEXT NULL");
                    console.log("  ✅ [MIGRATION] Added secondary_boutique_ids via Raw SQL");
                } catch (e) {
                    // Si l'erreur est 'Duplicate column name', on ignore, c'est que c'est déjà bon
                    if (!e.message.includes("Duplicate column")) {
                        console.warn("  ⚠️ [MIGRATION] Raw SQL Fallback failed:", e.message);
                    }
                }

                const colMigrations = [
                    // profiles
                    { table: 'profiles',              col: 'last_abandoned_reminder_at', def: { type: DataTypes.DATE,           allowNull: true } },
                    { table: 'profiles',              col: 'last_reengagement_at',        def: { type: DataTypes.DATE,           allowNull: true } },
                    { table: 'profiles',              col: 'last_vip_message_at',         def: { type: DataTypes.DATE,           allowNull: true } },
                    // orders
                    { table: 'orders',                col: 'review_reminder_sent_at',     def: { type: DataTypes.DATE,           allowNull: true } },
                    // products
                    { table: 'products',              col: 'boutique_id',                def: { type: DataTypes.CHAR(36),        allowNull: true } },
                    { table: 'products',              col: 'secondary_boutique_ids',     def: { type: DataTypes.TEXT,            allowNull: true } },
                    { table: 'products',              col: 'supplier_note',              def: { type: DataTypes.TEXT('long'),    allowNull: true } },
                    { table: 'products',              col: 'in_stock_supplier',          def: { type: DataTypes.BOOLEAN,         defaultValue: true } },
                    { table: 'products',              col: 'admin_feedback',             def: { type: DataTypes.TEXT('long'),    allowNull: true } },
                    // boutiques
                    { table: 'boutiques',             col: 'momo_number',                def: { type: DataTypes.STRING,          allowNull: true } },
                    { table: 'boutiques',             col: 'whatsapp',                   def: { type: DataTypes.STRING,          allowNull: true } },
                    { table: 'boutiques',             col: 'departement_id',             def: { type: DataTypes.STRING,          allowNull: true } },
                    { table: 'boutiques',             col: 'departement_label',          def: { type: DataTypes.STRING,          allowNull: true } },
                    { table: 'boutiques',             col: 'commune_id',                 def: { type: DataTypes.STRING,          allowNull: true } },
                    { table: 'boutiques',             col: 'commune_label',              def: { type: DataTypes.STRING,          allowNull: true } },
                    { table: 'boutiques',             col: 'quartier_id',                def: { type: DataTypes.STRING,          allowNull: true } },
                    { table: 'boutiques',             col: 'quartier_label',             def: { type: DataTypes.STRING,          allowNull: true } },
                    // cart_items
                    { table: 'cart_items',            col: 'price_snapshot',             def: { type: DataTypes.DECIMAL(15, 2), allowNull: true } },
                    { table: 'cart_items',            col: 'image_url',                  def: { type: DataTypes.TEXT,            allowNull: true } },
                    { table: 'cart_items',            col: 'selected_attributes',        def: { type: DataTypes.JSON,            defaultValue: {} } },
                    // supplier_products
                    { table: 'supplier_products',     col: 'available',                  def: { type: DataTypes.BOOLEAN,         defaultValue: true } },
                    { table: 'supplier_products',     col: 'approval_status',            def: { type: DataTypes.STRING,          defaultValue: 'En attente' } },
                    { table: 'supplier_products',     col: 'admin_feedback',             def: { type: DataTypes.TEXT('long'),    allowNull: true } },
                    { table: 'supplier_products',     col: 'variant_id',                 def: { type: DataTypes.CHAR(36),        allowNull: true } },
                    // product_variant_prices
                    { table: 'product_variant_prices', col: 'image_url',                 def: { type: DataTypes.TEXT,            allowNull: true } },
                    { table: 'product_variant_prices', col: 'old_price',                 def: { type: DataTypes.DECIMAL(15, 2), allowNull: true } },
                    // suppliers
                    { table: 'suppliers',             col: 'terms_accepted',             def: { type: DataTypes.BOOLEAN,         defaultValue: false } },
                    { table: 'suppliers',             col: 'electronic_signature',       def: { type: DataTypes.STRING,          allowNull: true } },
                    { table: 'suppliers',             col: 'whatsapp',                   def: { type: DataTypes.STRING,          allowNull: true } },
                    { table: 'suppliers',             col: 'momo_number',                def: { type: DataTypes.STRING,          allowNull: true } },
                    { table: 'suppliers',             col: 'departement_id',             def: { type: DataTypes.STRING,          allowNull: true } },
                    { table: 'suppliers',             col: 'departement_label',          def: { type: DataTypes.STRING,          allowNull: true } },
                    { table: 'suppliers',             col: 'commune_id',                 def: { type: DataTypes.STRING,          allowNull: true } },
                    { table: 'suppliers',             col: 'commune_label',              def: { type: DataTypes.STRING,          allowNull: true } },
                    { table: 'suppliers',             col: 'quartier_id',                def: { type: DataTypes.STRING,          allowNull: true } },
                    { table: 'suppliers',             col: 'quartier_label',             def: { type: DataTypes.STRING,          allowNull: true } },
                    { table: 'suppliers',             col: 'lat',                        def: { type: DataTypes.DECIMAL(10, 8), allowNull: true } },
                    { table: 'suppliers',             col: 'lng',                        def: { type: DataTypes.DECIMAL(11, 8), allowNull: true } },
                    // Marketplace updates (New)
                    { table: 'categories',            col: 'commission_rate',            def: { type: DataTypes.DECIMAL(5, 2),  allowNull: true } },
                    { table: 'orders',                col: 'dispute_status',             def: { type: DataTypes.STRING(30),     allowNull: true } },
                    { table: 'orders',                col: 'is_parent',                  def: { type: DataTypes.BOOLEAN,        defaultValue: false } },
                    { table: 'orders',                col: 'parent_id',                  def: { type: DataTypes.CHAR(36),       allowNull: true } },
                    { table: 'orders',                col: 'whatsapp_notif_phone',       def: { type: DataTypes.STRING(30),     allowNull: true } },
                    { table: 'delivery_persons',      col: 'whatsapp',                   def: { type: DataTypes.STRING(30),     allowNull: true } },
                    { table: 'support_messages',      col: 'order_id',                   def: { type: DataTypes.CHAR(36),       allowNull: true } },
                    { table: 'support_messages',      col: 'type',                       def: { type: DataTypes.STRING(20),     defaultValue: 'message' } },
                    { table: 'financial_transactions', col: 'source',                    def: { type: DataTypes.STRING(32),     allowNull: true } },
                    // order_items
                    { table: 'order_items',           col: 'original_price',             def: { type: DataTypes.DECIMAL(15, 2), allowNull: true } },
                ];


                for (const m of colMigrations) {
                    try {
                        const [rows] = await sequelize.query(
                            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '${m.table}' AND COLUMN_NAME = '${m.col}'`
                        );
                        if (rows.length === 0) {
                            await qi.addColumn(m.table, m.col, m.def);
                            console.log(`  ✅ [MIGRATION] Added: ${m.table}.${m.col}`);
                        }
                    } catch (colErr) {
                        console.warn(`  ⚠️ [MIGRATION] Skipped ${m.table}.${m.col}: ${colErr.message}`);
                    }
                }
                console.log("✅ [MIGRATION] Column migrations complete.");
            } catch (migErr) {
                console.warn("⚠️ [MIGRATION] Migration block failed (non-critical):", migErr.message);
            }

            console.log(`✅ [BOOT] Database synced (${isProd ? 'Safe Mode' : 'Alter Mode'}).`);
            try {
                const { Config } = await import('./models/index.js');
                await Config.destroy({ where: { key: ['base_delivery_fee', 'commission_rate'] } });
                console.log("🗑️ [CLEANUP] Deleted obsolete configurations (base_delivery_fee, commission_rate).");
            } catch (cleanupErr) {
                console.warn("⚠️ [CLEANUP] Failed to delete obsolete configs:", cleanupErr.message);
            }
        } catch (syncError) {
            console.error("❌ [BOOT] Global sync failed:", syncError.message);
            console.warn("⚠️ [BOOT] Attempting granular safe sync...");
            
            for (const modelName of Object.keys(sequelize.models)) {
                try {
                    // On force le mode sans alter pour tous les modèles en cas d'échec global
                    await sequelize.models[modelName].sync({ alter: false });
                    console.log(`  - ${modelName}: Synced (Safe)`);
                } catch (modelError) {
                    console.error(`❌ [BOOT] Granular sync failed for ${modelName}:`, modelError.message);
                }
            }
        }
        
        await runMasterSeed();
        startJobs();
    })
    .catch(err => {
        console.error("❌ [DB] Database connection failed:", err.message);
        console.error("⚠️ [BOOT] API running in degraded mode (No Database)");
    });
