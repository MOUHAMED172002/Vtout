import { auth } from "../config/auth.js";
import { toNodeHandler } from "better-auth/node";
import { Profile } from '../models/index.js';
import sequelize from '../config/database.js';

// Express middleware that handles Better Auth's endpoints directly
export const betterAuthMiddleware = toNodeHandler(auth);

// Populates req.auth by verifying the session via header or cookie
export const authMiddleware = async (req, res, next) => {
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
                
                // Fallback 1: Try as a session token
                session = await auth.api.getSession({
                    headers: {
                        cookie: `better-auth.session-token=${sessionId}`
                    }
                });

                // Fallback 2: Direct Database Lookup for Session ID (clerk-shim compatibility)
                if (!session) {
                    try {
                        const [row] = await sequelize.query(
                            "SELECT * FROM session WHERE id = ? AND expiresAt > NOW() LIMIT 1",
                            { replacements: [sessionId], type: sequelize.QueryTypes.SELECT }
                        );

                        if (row) {
                            const uId = row.user_id || row.userId;
                            const [userRow] = await sequelize.query(
                                "SELECT * FROM user WHERE id = ? LIMIT 1",
                                { replacements: [uId], type: sequelize.QueryTypes.SELECT }
                            );
                            if (userRow) {
                                // Reconstruct session object
                                session = { 
                                    user: {
                                        id: userRow.id,
                                        email: userRow.email,
                                        name: userRow.name,
                                        role: userRow.role || 'user'
                                    }, 
                                    session: row 
                                };
                            }
                        }
                    } catch (dbErr) {
                        console.error("[authMiddleware] DB Fallback Error:", dbErr.message);
                    }
                }
            }
        }

        if (session && session.user) {
            let profile = await Profile.findOne({ where: { email: session.user.email } });

            if (!profile) {
                // If the user signed up via better-auth but has no Profile yet, we create it.
                // Use the role stored in Better Auth (e.g. 'fournisseur' set during signUp)
                const roleFromAuth = session.user.role || 'user';
                profile = await Profile.create({
                    id: session.user.id,
                    email: session.user.email,
                    fullname: session.user.name || '',
                    role: roleFromAuth
                });
                // Also persist the role back to the `user` table to keep them in sync
                try {
                    await sequelize.query(
                        'UPDATE `user` SET role = :role WHERE id = :id',
                        { replacements: { role: roleFromAuth, id: session.user.id }, type: sequelize.QueryTypes.UPDATE }
                    );
                } catch (_) { /* non-bloquant */ }
            } else if (session.user.role && profile.role !== session.user.role) {
                // Sync role if Better Auth and profile are out of step
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
        console.error("[authMiddleware] Global Error:", err);
        req.auth = { userId: null, clerkId: null };
        next();
    }
};

export const requireAuth = (req, res, next) => {
    if (!req.auth || !req.auth.userId) {
        return res.status(401).json({ error: 'Non autorisé' });
    }
    next();
};

export const requireAdmin = async (req, res, next) => {
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

export const requireLivreur = async (req, res, next) => {
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

export const requireFournisseur = async (req, res, next) => {
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
