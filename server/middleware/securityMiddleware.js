const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const hpp = require('hpp');
const xss = require('xss-clean');

// General Rate Limiter: 1000 requests per 15 minutes (Relaxed for dev)
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: { error: "Trop de requêtes, veuillez réessayer plus tard." },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict Rate Limiter for sensitive operations: 10 requests per 15 minutes
const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: "Action suspecte. Tentatives trop fréquentes." },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    applySecurity: (app) => {
        // 1. Set Security Headers
        app.use(helmet());

        // 2. Prevent XSS attacks (Temporarily disabled due to compatibility issues with req.query)
        // app.use(xss());

        // 3. Prevent HTTP Parameter Pollution
        app.use(hpp());

        // 4. Apply Rate Limiting to all routes
        app.use("/api/", generalLimiter);

        // 5. Apply Strict Limiting to Auth and Payment routes
        app.use("/api/auth", strictLimiter);
        app.use("/api/create-fedapay", strictLimiter);
        app.use("/api/orders", (req, res, next) => {
            if (req.method === 'POST') return strictLimiter(req, res, next);
            next();
        });
    }
};
