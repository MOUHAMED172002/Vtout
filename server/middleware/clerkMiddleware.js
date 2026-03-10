const { clerkClient, verifyToken } = require('@clerk/clerk-sdk-node');

// Custom permissive middleware using verifyToken directly
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log(`[authMiddleware] Header present: ${!!authHeader}`);

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            console.log(`[authMiddleware] Verifying token (length: ${token.length})...`);
            try {
                const payload = await verifyToken(token, {
                    secretKey: process.env.CLERK_SECRET_KEY,
                    clockSkew: 10000,
                });
                console.log(`[authMiddleware] Token verified. sub: ${payload.sub}`);

                const { Profile } = require('../models');
                const profile = await Profile.findOne({ where: { clerk_id: payload.sub } });
                console.log(`[authMiddleware] Profile found: ${!!profile}, clerk_id: ${payload.sub}`);
                if (profile) {
                    console.log(`[authMiddleware] Profile email: ${profile.email}, role: ${profile.role}`);
                }

                req.auth = {
                    clerkId: payload.sub,
                    userId: profile ? profile.id : null,
                    role: profile ? profile.role : 'user',
                    email: profile ? profile.email : (payload.email || payload.primary_email_address || null),
                    sessionClaims: payload
                };
                console.log(`[authMiddleware] req.auth populated:`, JSON.stringify(req.auth, (k, v) => k === 'sessionClaims' ? undefined : v));
            } catch (authErr) {
                console.error("[authMiddleware] JWT Verify Error:", authErr.message);
                req.auth = { userId: null, clerkId: null, role: 'user', email: null };
            }
        } else {
            if (authHeader) console.log("[authMiddleware] Malformed Auth Header");
            req.auth = { userId: null, clerkId: null, role: 'user', email: null };
        }
        next();
    } catch (err) {
        console.error("[authMiddleware] Global Error:", err.message);
        req.auth = { userId: null, clerkId: null };
        next();
    }
};

// Middleware pour forcer l'authentification sur certaines routes
const requireAuth = (req, res, next) => {
    console.log(`[requireAuth] clerkId: ${req.auth?.clerkId}`);
    if (!req.auth || !req.auth.clerkId) {
        console.warn(`[requireAuth] Access denied: Missing clerkId`);
        return res.status(401).json({ error: 'Non autorisé' });
    }
    next();
};

// Middleware pour vérifier si l'utilisateur est admin
const requireAdmin = async (req, res, next) => {
    try {
        if (!req.auth || !req.auth.userId) {
            return res.status(401).json({ error: 'Non autorisé' });
        }

        const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
        const userEmail = req.auth.email?.toLowerCase();

        console.log(`[requireAdmin] Checking userId: ${req.auth.userId}, role: ${req.auth.role}, email: ${userEmail}`);

        if (req.auth.role === 'admin' || adminEmails.includes(userEmail)) {
            // Auto-promotion logic if role is not admin in DB but email is in list
            if (req.auth.role !== 'admin') {
                const { Profile } = require('../models');
                const profile = await Profile.findByPk(req.auth.userId);
                if (profile) {
                    console.log(`[requireAdmin] Auto-promoting ${userEmail} to admin`);
                    profile.role = 'admin';
                    await profile.save();
                    req.auth.role = 'admin';
                }
            }
            return next();
        }

        console.warn(`[requireAdmin] Access denied for user ${req.auth.userId}. Role: ${req.auth.role}`);
        return res.status(403).json({ error: 'Accès restreint aux administrateurs' });
    } catch (err) {
        console.error("RequireAdmin Error:", err);
        res.status(500).json({ error: "Erreur lors de la vérification des droits admin" });
    }
};

// Middleware pour vérifier si l'utilisateur est un livreur
const requireLivreur = async (req, res, next) => {
    try {
        if (!req.auth || !req.auth.userId) {
            return res.status(401).json({ error: 'Non autorisé' });
        }

        const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
        const userEmail = req.auth.email?.toLowerCase();

        console.log(`[requireLivreur] Checking userId: ${req.auth.userId}, role: ${req.auth.role}, email: ${userEmail}`);

        if (req.auth.role === 'livreur' || req.auth.role === 'admin' || adminEmails.includes(userEmail)) {
            // Auto-promote to admin if email is in list but role is not admin/livreur
            if (req.auth.role !== 'admin' && req.auth.role !== 'livreur' && adminEmails.includes(userEmail)) {
                const { Profile } = require('../models');
                const profile = await Profile.findByPk(req.auth.userId);
                if (profile) {
                    console.log(`[requireLivreur] Auto-promoting ${userEmail} to admin`);
                    profile.role = 'admin';
                    await profile.save();
                    req.auth.role = 'admin';
                }
            }
            return next();
        }

        console.warn(`[requireLivreur] Access denied for user ${req.auth.userId}. Role: ${req.auth.role}`);
        return res.status(403).json({ error: 'Accès réservé aux livreurs' });
    } catch (err) {
        console.error("RequireLivreur Error:", err);
        res.status(500).json({ error: "Erreur lors de la vérification des droits livreur" });
    }
};

// Middleware pour vérifier si l'utilisateur est un fournisseur
const requireFournisseur = async (req, res, next) => {
    try {
        if (!req.auth || !req.auth.userId) {
            return res.status(401).json({ error: 'Non autorisé' });
        }

        const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
        const userEmail = req.auth.email?.toLowerCase();

        if (req.auth.role === 'fournisseur' || req.auth.role === 'admin' || adminEmails.includes(userEmail)) {
            return next();
        }

        console.warn(`[requireFournisseur] Access denied for user ${req.auth.userId}. Role: ${req.auth.role}`);
        return res.status(403).json({ error: 'Accès réservé aux fournisseurs' });
    } catch (err) {
        console.error("RequireFournisseur Error:", err);
        res.status(500).json({ error: "Erreur lors de la vérification des droits fournisseur" });
    }
};

module.exports = { authMiddleware, requireAuth, requireAdmin, requireLivreur, requireFournisseur };
