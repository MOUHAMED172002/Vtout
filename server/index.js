import "dotenv/config";
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
import { Config, SupportMessage } from "./models/index.js";
import { runMasterSeed } from "./masterSeed.js";
import { processAbandonedCarts } from "./services/abandonedCartService.js";

// --- BACKGROUND JOBS ---
const startJobs = () => {
    console.log("⏰ [JOBS] Démarrage des tâches de fond...");
    
    // Relance des paniers abandonnés (toutes les heures)
    setInterval(() => {
        processAbandonedCarts().catch(err => console.error("[JOB ERROR] Abandoned Carts:", err));
    }, 60 * 60 * 1000);

    // Premier passage 1 minute après le démarrage
    setTimeout(() => {
        processAbandonedCarts().catch(err => console.error("[JOB ERROR] Abandoned Carts (Initial):", err));
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
app.get("/api/api/verify-email", (req, res) => {
    const target = req.originalUrl.replace("/api/api/", "/api/");
    res.redirect(target);
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

app.use((err, req, res, next) => {
    console.error('>>> [GLOBAL ERROR]:', err);
    res.status(500).json({ 
        error: 'Internal Server Error', 
        message: err.message, 
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
});


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
/* 
    socket.on('driver_location', (data) => {
        if (data.orderId) {
            io.emit(`order_update_${data.orderId}`, data);
        }
        io.emit('admin_driver_update', data);
    });
*/

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

// --- Global Error Handler ---
app.use((err, req, res, next) => {
    console.error(`[FATAL ERROR] ${req.method} ${req.url}:`, err);
    res.status(500).json({ 
        error: "Erreur interne du serveur", 
        message: err.message, 
        path: req.url 
    });
});

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

// --- STARTUP LOGIC ---
console.log("🚀 [BOOT] Starting Vtout API...");
console.log(">>> [BOOT] Configured ALLOWED_ORIGINS:", process.env.ALLOWED_ORIGINS);

// Start HTTP server immediately so port 3000 is open
startServer();

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
            console.log(`✅ [BOOT] Database synced (${isProd ? 'Safe Mode' : 'Alter Mode'}).`);
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
