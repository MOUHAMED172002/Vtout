import "dotenv/config";
console.log(">>> [BOOT] Server execution started");
console.log(">>> [BOOT] Env: PORT=" + process.env.PORT + ", DB=" + (process.env.MYSQL_DATABASE_URL ? "Defined" : "Not Defined"));

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
import paymentRoutes from "./routes/paymentRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { adminSyncFinancials } from "./controllers/financialController.js";
import { SupportMessage } from "./models/index.js";

// Webhooks & Special routes
import createFedapay from "./api/create-fedapay.js";
import fedapayWebhook from "./api/fedapay-webhook.js";

const app = express();

process.on('uncaughtException', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`[FATAL] Port already in use and could not be freed. Exiting.`);
        process.exit(1);
    }
    console.error('[FATAL] Uncaught Exception:', err.message);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    console.error('[FATAL] Unhandled Rejection:', reason?.message || reason);
    // Do not exit the process to keep the server running
});

// Dev ports that we run Vite on
const DEV_PORTS = [5173, 5174, 5175, 5176, 5177];

const isAllowedOrigin = (origin) => {
    if (!origin) return true; 

    try {
        const url = new URL(origin);
        const hostname = url.hostname;
        const port = parseInt(url.port, 10);

        if (hostname === 'localhost' || hostname === '127.0.0.1') return true;

        const isPrivateIP =
            /^10\./.test(hostname) ||
            /^192\.168\./.test(hostname) ||
            /^172\.(1[6-9]|2\d|3[01])\./.test(hostname);

        if (isPrivateIP && DEV_PORTS.includes(port)) return true;

        const explicit = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim());
        return explicit.includes(origin);
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

const PORT = process.env.PORT || 3000;

app.use("/api/auth", (req, res, next) => {
    betterAuthMiddleware(req, res);
});

app.use(express.json({ limit: '10kb' }));
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
app.use("/api/locations", locationRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/financials", financialRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

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
    },
    transports: ['websocket', 'polling']
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

const startServer = (attempt = 1) => {
    server.once('listening', () => {
        console.log(`✅ Vtout API running on http://localhost:${PORT}`);
    });

    server.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            if (attempt >= 5) {
                console.error(`[FATAL] Port ${PORT} still busy after ${attempt} attempts. Please kill the process using it. Exiting.`);
                process.exit(1);
            }
            console.error(`[WARN] Port ${PORT} busy (attempt ${attempt}). Retrying in 3s...`);
            server.close();
            setTimeout(() => startServer(attempt + 1), 3000);
        } else {
            console.error('[FATAL] Server error:', err.message);
            process.exit(1);
        }
    });

    server.listen(PORT, '0.0.0.0');
};

console.log("🚀 Initializing Database...");
sequelize.authenticate()
    .then(() => {
        console.log("💾 Database connected");
        // alter:false = crée les tables manquantes uniquement, sans toucher aux existantes
        // Ceci évite les ECONNRESET causés par les lourds ALTER TABLE de XAMPP
        return sequelize.sync({ alter: false });
    })
    .then(() => {
        console.log("📁 Database tables synced");
        console.log("🚀 Starting Vtout API...");
        startServer();
    })
    .catch(err => {
        console.error("❌ Database sync/connection failed:", err.message);
        process.exit(1);
    });
