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

// Paths used by bots to scan for vulnerabilities (WordPress, Laravel, etc.)
const blockedPaths = [
    '/xmlrpc.php',
    '/wp-admin',
    '/wp-includes',
    '/wp-content',
    '/wp-login.php',
    '/wlwmanifest.xml',
    '/.env',
    '/.git',
    '/install.php',
    '/_ignition',
    '/vendor/phpunit',
    '/.aws',
    '/.vscode',
    '/phpmyadmin'
];

export const blockExploitPaths = (req, res, next) => {
    const url = req.originalUrl.toLowerCase();
    if (blockedPaths.some(path => url.includes(path.toLowerCase()))) {
        console.warn(`[SECURITY] Blocked exploit scan: ${req.method} ${req.originalUrl} from ${req.ip}`);
        return res.status(403).json({ error: "Access Denied" });
    }
    next();
};

export const applySecurity = (app) => {
    // 0. Block exploit scans early
    app.use(blockExploitPaths);

    // 1. Set Security Headers
    app.use(helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        contentSecurityPolicy: false, // Disabled to prevent blocking WebSockets/external APIs
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
