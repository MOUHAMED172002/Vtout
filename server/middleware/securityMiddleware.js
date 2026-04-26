import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import xss from 'xss-clean';

// General Rate Limiter: 1000 requests per 15 minutes (Relaxed for dev)
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: { error: "Trop de requêtes, veuillez réessayer plus tard." },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict Rate Limiter for sensitive operations: 500 requests per 15 minutes
const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: { error: "Action suspecte. Tentatives trop fréquentes." },
    standardHeaders: true,
    legacyHeaders: false,
});

export const applySecurity = (app) => {
    // 1. Set Security Headers
    app.use(helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    }));

    // 2. Prevent HTTP Parameter Pollution
    app.use(hpp());

    // 3. Prevent XSS attacks (Disabled: xss-clean is incompatible with Express 5)
    // app.use(xss());

    // 4. Apply Rate Limiting to all routes
    app.use("/api/", generalLimiter);

    // 5. Apply Strict Limiting to Auth and Payment routes
    app.use("/api/auth", strictLimiter);
    app.use("/api/create-fedapay", strictLimiter);
    app.use("/api/orders", (req, res, next) => {
        if (req.method === 'POST') return strictLimiter(req, res, next);
        next();
    });

};
