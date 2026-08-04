import { Profile, Supplier, DeliveryPerson, sequelize } from '../models/index.js';
import crypto from 'crypto';
import { sendWhatsAppMessage, getWhatsAppConfigs } from '../services/whatsappService.js';
import { getTextTemplate } from '../services/textTemplateService.js';


export const syncProfile = async (req, res) => {
    try {
        const { userId } = req.auth;
        if (!userId) {
            return res.status(401).json({ error: 'Non authentifié' });
        }
        let profile = await Profile.findByPk(userId);
        
        if (!profile) {
            // Fetch user from better-auth 'user' table and create the Profile dynamically
            const [users] = await sequelize.query(`SELECT * FROM \`user\` WHERE id = :id`, {
                replacements: { id: userId }
            });
            if (users && users.length > 0) {
                const u = users[0];
                profile = await Profile.create({
                    id: u.id,
                    email: u.email,
                    fullname: u.name || 'Utilisateur',
                    role: u.role || 'user',
                    email_verified: !!u.emailVerified,
                    phone: u.email.includes('@whatsapp') ? u.email.split('@')[0] : null
                });
            } else {
                return res.status(404).json({ error: 'Profil introuvable' });
            }
        }
        
        res.json(profile);
    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).json({ error: 'Erreur lors de la synchronisation du profil' });
    }
};

export const getMe = async (req, res) => {
    try {
        const { userId } = req.auth;
        if (!userId) return res.status(404).json({ error: 'Profil non trouvé' });
        
        const profile = await Profile.findByPk(userId);
        if (!profile) return res.status(404).json({ error: 'Profil non trouvé' });

        // Synchronize email_verified from better-auth user table if needed
        if (!profile.email_verified) {
            const [users] = await sequelize.query(`SELECT emailVerified FROM \`user\` WHERE id = :id`, {
                replacements: { id: userId }
            });
            if (users && users.length > 0) {
                const isVerified = !!users[0].emailVerified;
                if (isVerified) {
                    profile.email_verified = true;
                    await profile.save();
                }
            }
        }

        // Détection des casquettes multiples
        const hasSupplierProfile = await Supplier.findOne({ where: { user_id: userId } });
        const hasDeliveryProfile = await DeliveryPerson.findOne({ where: { user_id: userId } });

        const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
        const isAdmin = profile.role === 'admin' || adminEmails.includes(profile.email?.toLowerCase());

        res.json({
            ...profile.toJSON(),
            isSupplier: !!hasSupplierProfile,
            isDelivery: !!hasDeliveryProfile,
            isAdmin: isAdmin
        });
    } catch (error) {
        console.error('getMe error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};


// Désactivation de compte (soft delete) : le profil est anonymisé et
// marqué `deleted_at`, ce qui bloque immédiatement tout accès à l'API
// applicative (voir authMiddleware.js, qui neutralise req.auth pour tout
// profil ainsi marqué). L'historique (commandes, avis, paiements) est
// conservé intact pour les vendeurs et la comptabilité — voir décision
// produit : suppression = désactivation, pas d'effacement définitif.
export const deleteMe = async (req, res) => {
    try {
        const { userId } = req.auth;
        if (!userId) return res.status(404).json({ error: 'Profil non trouvé' });

        const profile = await Profile.findByPk(userId);
        if (!profile) return res.status(404).json({ error: 'Profil non trouvé' });

        profile.fullname = 'Compte supprimé';
        profile.first_name = null;
        profile.last_name = null;
        profile.phone = null;
        profile.avatar_url = null;
        profile.deleted_at = new Date();
        await profile.save();

        // Révoque les sessions actives (best-effort — l'accès est de toute
        // façon déjà coupé côté API applicative même si ceci échoue).
        try {
            await sequelize.query('DELETE FROM `session` WHERE `userId` = :userId', {
                replacements: { userId }
            });
        } catch (revokeError) {
            console.warn('[deleteMe] Session revocation failed:', revokeError.message);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('deleteMe error:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression du compte' });
    }
};

export const updateMe = async (req, res) => {
    try {
        const { userId } = req.auth;
        if (!userId) return res.status(404).json({ error: 'Profil non trouvé' });
        const { fullname, phone, avatar_url } = req.body;

        let profile = await Profile.findByPk(userId);
        if (!profile) return res.status(404).json({ error: 'Profil non trouvé' });

        const isFirstPhone = !profile.phone && phone;

        if (fullname) {
            profile.fullname = fullname;
            const names = fullname.split(' ');
            profile.first_name = names[0] || '';
            profile.last_name = names.slice(1).join(' ') || '';
        }
        if (phone !== undefined) profile.phone = phone;
        if (avatar_url !== undefined) profile.avatar_url = avatar_url;

        await profile.save();

        // Envoyer le message de bienvenue WhatsApp quand le client ajoute son numéro pour la 1ère fois
        if (isFirstPhone) {
            const clientName = profile.fullname || profile.first_name || 'cher client';
            const defaultMsg = `🎉 *Bienvenue sur VTOUT, {{clientName}} !*\n\nVotre compte a été créé avec succès.\n\nDécouvrez des milliers de produits de qualité livrés chez vous au Bénin.\n\n🛍️ Commencez vos achats : https://vtout.com`;
            getTextTemplate('whatsapp_welcome_customer', defaultMsg, { clientName })
                .then(msg => sendWhatsAppMessage(phone, msg))
                .catch(() => {});
        }

        // Propagate updates to Supplier and DeliveryPerson if they exist
        const updates = {};
        if (phone !== undefined) updates.phone = phone;

        if (Object.keys(updates).length > 0) {
            await Supplier.update(updates, { where: { user_id: userId } });
            await DeliveryPerson.update(updates, { where: { user_id: userId } });
        }
        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
    }
};

// Enregistre le jeton de push Expo de l'appareil courant (app mobile).
// Un même compte peut avoir plusieurs jetons (plusieurs appareils) — on
// dédoublonne simplement dans le tableau. Stocké dans profiles.metadata
// pour éviter une migration de schéma.
export const registerPushToken = async (req, res) => {
    try {
        const { userId } = req.auth;
        if (!userId) return res.status(401).json({ error: 'Non authentifié' });

        const { token } = req.body;
        if (!token || typeof token !== 'string') {
            return res.status(400).json({ error: 'Jeton push manquant' });
        }

        const profile = await Profile.findByPk(userId);
        if (!profile) return res.status(404).json({ error: 'Profil non trouvé' });

        const existing = Array.isArray(profile.metadata?.expo_push_tokens) ? profile.metadata.expo_push_tokens : [];
        const tokens = Array.from(new Set([...existing, token]));
        profile.metadata = { ...profile.metadata, expo_push_tokens: tokens };
        await profile.save();

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de l'enregistrement du jeton push" });
    }
};

// Retire le jeton de push de l'appareil courant. Sans `token` dans le
// corps de la requête (cas de la déconnexion mobile), retire TOUS les
// jetons du compte — plus simple et sûr que de traquer le jeton précis de
// l'appareil jusqu'à l'appel de déconnexion.
export const removePushToken = async (req, res) => {
    try {
        const { userId } = req.auth;
        if (!userId) return res.status(401).json({ error: 'Non authentifié' });

        const { token } = req.body || {};
        const profile = await Profile.findByPk(userId);
        if (!profile) return res.status(404).json({ error: 'Profil non trouvé' });

        const existing = Array.isArray(profile.metadata?.expo_push_tokens) ? profile.metadata.expo_push_tokens : [];
        const remaining = token ? existing.filter((t) => t !== token) : [];
        profile.metadata = { ...profile.metadata, expo_push_tokens: remaining };
        await profile.save();

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors du retrait du jeton push" });
    }
};

export const getAllProfiles = async (req, res) => {
    try {
        const profiles = await Profile.findAll();
        res.json(profiles);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des profils' });
    }
};

export const getProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.auth?.userId;
        const role = req.auth?.role;
        const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
        const userEmail = req.auth?.email?.toLowerCase();
        const isAdmin = role === 'admin' || (userEmail && adminEmails.includes(userEmail));

        // Protection IDOR: Only allow if it's the user's own profile, or if the user is an admin
        if (userId !== id && !isAdmin) {
             return res.status(403).json({ error: 'Accès non autorisé à ce profil' });
        }

        const profile = await Profile.findByPk(id);
        if (!profile) return res.status(404).json({ error: 'Profil non trouvé' });
        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const updateProfileStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;
        const profile = await Profile.findByPk(id);
        if (!profile) return res.status(404).json({ error: 'Profil non trouvé' });

        profile.is_active = is_active;
        await profile.save();

        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
    }
};

export const switchRole = async (req, res) => {
    try {
        const { userId } = req.auth;
        const { newRole } = req.body;

        if (!userId) return res.status(401).json({ error: 'Non authentifié' });

        const validRoles = ['user', 'fournisseur', 'livreur'];
        if (!validRoles.includes(newRole)) {
            return res.status(400).json({ error: 'Rôle invalide' });
        }

        const profile = await Profile.findByPk(userId);
        if (!profile) return res.status(404).json({ error: 'Profil non trouvé' });

        // --- ONBOARDING AUTOMATIQUE ---
        
        if (newRole === 'fournisseur') {
            const existingSupplier = await Supplier.findOne({ where: { user_id: userId } });
            if (!existingSupplier) {
                await Supplier.create({
                    id: crypto.randomUUID(),
                    user_id: userId,
                    name: profile.fullname || 'Ma Boutique',
                    email: profile.email,
                    status: 'En attente'
                });
            }
        }

        if (newRole === 'livreur') {
            const existingRider = await DeliveryPerson.findOne({ where: { user_id: userId } });
            if (!existingRider) {
                await DeliveryPerson.create({
                    user_id: userId,
                    vehicle_type: 'moto',
                    status: 'hors_ligne',
                    is_active: true
                });
            }
        }

        // Update role in both tables
        profile.role = newRole;
        await profile.save();
        
        try {
            await sequelize.query(
                'UPDATE user SET role = :role WHERE id = :id',
                {
                    replacements: { role: newRole, id: userId },
                    type: sequelize.QueryTypes.UPDATE
                }
            );
        } catch (authError) {
             console.warn('Could not update Better Auth user role:', authError.message);
        }

        res.json({ message: `Rôle mis à jour avec succès : ${newRole}`, role: newRole });
    } catch (error) {
        console.error('switchRole error:', error);
        res.status(500).json({ error: 'Erreur lors du changement de rôle' });
    }
};