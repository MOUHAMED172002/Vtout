console.log("Loading environment...");
process.on('uncaughtException', (err) => {
    console.error('CRITICAL STARTUP ERROR - Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('CRITICAL STARTUP ERROR - Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
require("dotenv").config({ override: true });
console.log("Loading express and cors...");
const express = require("express");
const cors = require("cors");
console.log("Loading better-auth middleware...");
const { authMiddleware, betterAuthMiddleware } = require("./middleware/authMiddleware");
const { applySecurity } = require("./middleware/securityMiddleware");
console.log("Loading models...");
const { sequelize } = require("./models");
console.log("Loading routes...");

const app = express();

// Middlewares & Security
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};
app.use(cors(corsOptions));
applySecurity(app);

// IMPORTANT : Le middleware Better Auth DOIT être avant express.json()
// car Better Auth lit le stream natif de la requête. S'il est consommé par express.json,
// Better Auth reçoit un body vide et rejette avec 403 Forbidden !
app.use("/api/auth", betterAuthMiddleware);

app.use(express.json({ limit: '10kb' })); // Limit body size to prevent DoS

// Request logger
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl || req.url} - ${res.statusCode} (${duration}ms)`);
    });
    if (req.headers.authorization) {
        console.log(`  Auth: ${req.headers.authorization.substring(0, 20)}...`);
    } else {
        console.log("  Auth: Missing");
    }
    next();
});

// (Le middleware d'auth a été déplacé au-dessus de express.json)
app.use(authMiddleware); // Injecte req.auth sur toutes les routes

console.log("Loading routes...");
// Import routes
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
console.log("All routes loaded.");

app.get("/api/test-direct", (req, res) => res.json({ message: "Direct test works" }));

// routes
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

// Catch-all for undefined routes
app.use("/api", (req, res) => {
    console.log(`[404 NOT FOUND] ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});





// ping
app.get("/", (req, res) => res.send("API running with Better Auth & Sequelize"));

const PORT = process.env.PORT || 3000;

// Sync DB then starts server
console.log("Starting database sync...");
sequelize.sync().then(() => {
    console.log("Database sync complete. Starting server...");
    const server = app.listen(PORT, '0.0.0.0', () => console.log(`Server listening on http://localhost:${PORT}`));

    // Keep process alive explicitly for debugging
    setInterval(() => {
        // console.log('Heartbeat...');
    }, 10000);

}).catch(err => {
    console.error("Failed to sync DB:", err);
});

// Final Error Handler
app.use((err, req, res, next) => {
    console.error("GLOBAL ERROR:", err);
    const fs = require('fs');
    const path = require('path');
    const logFile = path.join(__dirname, 'error.log');
    const logMsg = `[${new Date().toISOString()}] GLOBAL ERROR: ${err.message}\n${err.stack}\n`;
    fs.appendFileSync(logFile, logMsg);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
});

// End of file
