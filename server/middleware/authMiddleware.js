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
            const roleFromAuth = session.user.role || 'user';

            // ── ATOMIC findOrCreate — prevents SequelizeUniqueConstraintError (ER_DUP_ENTRY)
            // caused by concurrent requests racing to create the same profile row.
            const [profile, created] = await Profile.findOrCreate({
                where: { email: session.user.email },
                defaults: {
                    id: session.user.id,
                    email: session.user.email,
                    fullname: session.user.name || '',
                    role: roleFromAuth,
                    email_verified: false
                }
            });

            if (created) {
                // New profile created — sync role back to `user` table (non-blocking)
                sequelize.query(
                    'UPDATE `user` SET role = :role WHERE id = :id',
                    { replacements: { role: roleFromAuth, id: session.user.id }, type: sequelize.QueryTypes.UPDATE }
                ).catch(() => {});

                // Send email verification (fire & forget — doesn't block request)
                import('../services/mailService.js').then(({ sendEmailVerification }) => {
                    sendEmailVerification(profile).catch(e =>
                        console.warn('[authMiddleware] Verification email failed:', e.message)
                    );
                }).catch(() => {});

            } else {
                // Existing profile — sync role if it changed
                if (session.user.role && profile.role !== session.user.role) {
                    profile.role = session.user.role;
                    await profile.save();
                }

                // If email still unverified, re-trigger verification email (fire & forget)
                if (!profile.email_verified) {
                    // Vérification anti-spam : ne pas renvoyer si un token valide existe déjà (moins de 24h)
                    sequelize.query(
                        `SELECT id FROM verification WHERE identifier = :email AND expiresAt > NOW() LIMIT 1`,
                        { replacements: { email: profile.email }, type: sequelize.QueryTypes.SELECT }
                    ).then(([existing]) => {
                        if (!existing) {
                            import('../services/mailService.js').then(({ sendEmailVerification }) => {
                                sendEmailVerification(profile).catch(() => {});
                            }).catch(() => {});
                        }
                    }).catch(() => {});
                }
            }

            req.auth = {
                clerkId: session.user.id,
                userId: profile.id,
                role: profile.role,
                email: profile.email,
                emailVerified: !!profile.email_verified,
                sessionClaims: session.session
            };
        } else {
            req.auth = { userId: null, clerkId: null, role: 'user', email: null };
        }
        next();
    } catch (err) {
        console.error("[authMiddleware] CRITICAL Error during profile sync:", err);
        // On ne bloque pas totalement pour permettre au moins l'accès aux routes publiques
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

        if (req.auth.role === 'admin' || adminEmails.includes(userEmail)) {
            return next();
        }

        // Vérification du profil livreur
        const { default: sequelizeInstance } = await import('../config/database.js');
        const [livreur] = await sequelizeInstance.query(
            'SELECT id FROM delivery_persons WHERE user_id = :userId LIMIT 1',
            { replacements: { userId: req.auth.userId }, type: sequelizeInstance.QueryTypes.SELECT }
        ).catch(() => []);

        if (req.auth.role === 'livreur' || livreur) {
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

        if (req.auth.role === 'admin' || adminEmails.includes(userEmail)) {
            return next();
        }

        // Vérification du profil fournisseur
        const { default: sequelizeInstance } = await import('../config/database.js');
        const [supplier] = await sequelizeInstance.query(
            'SELECT id FROM suppliers WHERE user_id = :userId LIMIT 1',
            { replacements: { userId: req.auth.userId }, type: sequelizeInstance.QueryTypes.SELECT }
        ).catch(() => []);

        if (req.auth.role === 'fournisseur' || supplier) {
            return next();
        }

        return res.status(403).json({ error: 'Profil fournisseur inexistant' });
    } catch (err) {
        res.status(500).json({ error: "Erreur fournisseur" });
    }
};
