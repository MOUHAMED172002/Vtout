const { auth } = require("../config/auth");
const { toNodeHandler } = require("better-auth/node");
const { Profile } = require('../models');

// Express middleware that handles Better Auth's endpoints directly
const betterAuthMiddleware = toNodeHandler(auth);

// Populates req.auth by verifying the session via header or cookie
const authMiddleware = async (req, res, next) => {
    try {
        // Support both Cookie and Authorization: Bearer <session_id>
        let session = await auth.api.getSession({
            headers: req.headers
        });

        // Fallback: If no session from headers/cookies, try manual Bearer token
        if (!session) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const sessionId = authHeader.split(' ')[1];
                session = await auth.api.getSession({
                    headers: {
                        cookie: `better-auth.session-token=${sessionId}`
                    }
                });
            }
        }

        if (session && session.user) {
            let profile = await Profile.findOne({ where: { email: session.user.email } });

            if (!profile) {
                // If the user signed up via better-auth but has no Profile yet, we create it.
                profile = await Profile.create({
                    id: session.user.id, // we can reuse better-auth id
                    email: session.user.email,
                    fullname: session.user.name || '',
                    role: session.user.role || 'user'
                });
            } else if (profile.role !== session.user.role && session.user.role) {
                // Sync role if necessary
                profile.role = session.user.role;
                await profile.save();
            }

            req.auth = {
                clerkId: session.user.id, // For backward compatibility
                userId: profile.id,
                role: profile.role,
                email: profile.email,
                sessionClaims: session.session
            };
        } else {
            req.auth = { userId: null, clerkId: null, role: 'user', email: null };
        }
        next();
    } catch (err) {
        console.error("[authMiddleware] Global Error:", err.message);
        req.auth = { userId: null, clerkId: null };
        next();
    }
};

const requireAuth = (req, res, next) => {
    if (!req.auth || !req.auth.userId) {
        return res.status(401).json({ error: 'Non autorisé' });
    }
    next();
};

const requireAdmin = async (req, res, next) => {
    try {
        if (!req.auth || !req.auth.userId) {
            return res.status(401).json({ error: 'Non autorisé' });
        }

        const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
        const userEmail = req.auth.email?.toLowerCase();

        if (req.auth.role === 'admin' || adminEmails.includes(userEmail)) {
            return next();
        }

        return res.status(403).json({ error: 'Accès restreint aux administrateurs' });
    } catch (err) {
        res.status(500).json({ error: "Erreur admin" });
    }
};

const requireLivreur = async (req, res, next) => {
    try {
        if (!req.auth || !req.auth.userId) return res.status(401).json({ error: 'Non autorisé' });

        const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
        const userEmail = req.auth.email?.toLowerCase();

        if (req.auth.role === 'livreur' || req.auth.role === 'admin' || adminEmails.includes(userEmail)) {
            return next();
        }

        return res.status(403).json({ error: 'Accès réservé aux livreurs' });
    } catch (err) {
        res.status(500).json({ error: "Erreur livreur" });
    }
};

const requireFournisseur = async (req, res, next) => {
    try {
        if (!req.auth || !req.auth.userId) return res.status(401).json({ error: 'Non autorisé' });

        const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
        const userEmail = req.auth.email?.toLowerCase();

        if (req.auth.role === 'fournisseur' || req.auth.role === 'admin' || adminEmails.includes(userEmail)) {
            return next();
        }

        return res.status(403).json({ error: 'Accès réservé aux fournisseurs' });
    } catch (err) {
        res.status(500).json({ error: "Erreur fournisseur" });
    }
};

module.exports = { authMiddleware, betterAuthMiddleware, requireAuth, requireAdmin, requireLivreur, requireFournisseur };
