require("dotenv").config({ override: true });

process.on('uncaughtException', (err) => {
    console.error('[FATAL] Uncaught Exception:', err.message);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    console.error('[FATAL] Unhandled Rejection:', reason);
    process.exit(1);
});

const express = require("express");
const cors = require("cors");
const { authMiddleware, betterAuthMiddleware } = require("./middleware/authMiddleware");
const { applySecurity } = require("./middleware/securityMiddleware");
const { sequelize } = require("./models");

const app = express();

const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};
app.use(cors(corsOptions));
applySecurity(app);

// Better Auth doit être AVANT express.json() pour lire le body natif
app.use("/api/auth", betterAuthMiddleware);
app.use(express.json({ limit: '10kb' }));
app.use(authMiddleware);

// Routes
const createFedapay = require("./api/create-fedapay");
const fedapayWebhook = require("./api/fedapay-webhook");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const attributeRoutes = require("./routes/attributeRoutes");
const profileRoutes = require("./routes/profileRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const orderRoutes = require("./routes/orderRoutes");
const addressRoutes = require("./routes/addressRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const statsRoutes = require("./routes/statsRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const cartRoutes = require("./routes/cartRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const contentRoutes = require("./routes/contentRoutes");
const policyRoutes = require("./routes/policyRoutes");
const configRoutes = require("./routes/configRoutes");
const supportRoutes = require("./routes/supportRoutes");

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
app.use("/api/support", supportRoutes);

app.get("/", (req, res) => res.send("Vtout API — Online"));

// 404 handler
app.use("/api", (req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} non trouvée` });
});

// Global error handler
app.use((err, req, res, next) => {
    const fs = require('fs');
    const path = require('path');
    const logMsg = `[${new Date().toISOString()}] ${err.message}\n${err.stack}\n`;
    fs.appendFileSync(path.join(__dirname, 'error.log'), logMsg);
    res.status(500).json({ error: "Erreur interne du serveur", details: err.message });
});

const PORT = process.env.PORT || 3000;

sequelize.sync().then(() => {
    const http = require('http');
    const { Server } = require('socket.io');

    const server = http.createServer(app);
    const io = new Server(server, { cors: corsOptions });

    io.on('connection', (socket) => {
        socket.on('join', (userId) => {
            socket.join(userId);
        });

        socket.on('driver_location', (data) => {
            if (data.orderId) {
                io.emit(`order_update_${data.orderId}`, data);
            }
            io.emit('admin_driver_update', data);
        });

        socket.on('send_message', async (message) => {
            const { SupportMessage } = require('./models');
            try {
                const msg = await SupportMessage.create(message);
                if (message.receiver_id) {
                    io.to(message.receiver_id).emit('new_message', msg);
                } else {
                    io.to('admins').emit('new_message', msg);
                }
                socket.emit('message_sent', msg);
            } catch (err) {
                // silently ignore socket chat errors
            }
        });

        socket.on('disconnect', () => {});
    });

    server.listen(PORT, '0.0.0.0', () => {
        console.log(`✅ Vtout API running on http://localhost:${PORT}`);
    });

}).catch(err => {
    console.error('[FATAL] DB sync failed:', err.message);
    process.exit(1);
});
