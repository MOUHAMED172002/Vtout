import { Profile, sequelize } from '../models/index.js';
import crypto from 'crypto';


export const syncProfile = async (req, res) => {
    try {
        const { userId } = req.auth;
        if (!userId) {
            return res.status(401).json({ error: 'Non authentifié' });
        }
        let profile = await Profile.findByPk(userId);
        if (!profile) return res.status(404).json({ error: 'Profil introuvable' });
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
        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const updateMe = async (req, res) => {
    try {
        const { userId } = req.auth;
        if (!userId) return res.status(404).json({ error: 'Profil non trouvé' });
        const { fullname, phone, avatar_url } = req.body;

        let profile = await Profile.findByPk(userId);
        if (!profile) return res.status(404).json({ error: 'Profil non trouvé' });

        if (fullname) {
            profile.fullname = fullname;
            const names = fullname.split(' ');
            profile.first_name = names[0] || '';
            profile.last_name = names.slice(1).join(' ') || '';
        }
        if (phone !== undefined) profile.phone = phone;
        if (avatar_url !== undefined) profile.avatar_url = avatar_url;

        await profile.save();
        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
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
        const { userId, role: currentRole } = req.auth;
        const { newRole } = req.body;

        if (!userId) return res.status(401).json({ error: 'Non authentifié' });
        
        // Safety: Don't allow switching IF the user is already an admin via env or database
        const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
        const userEmail = req.auth.email?.toLowerCase();
        
        /* 
        if (currentRole === 'admin' || adminEmails.includes(userEmail)) {
             return res.status(403).json({ error: 'Les administrateurs ne peuvent pas changer de rôle via cette interface.' });
        }
        */

        const validRoles = ['user', 'fournisseur', 'livreur'];
        if (!validRoles.includes(newRole)) {
            return res.status(400).json({ error: 'Rôle invalide' });
        }

        const profile = await Profile.findByPk(userId);
        if (!profile) return res.status(404).json({ error: 'Profil non trouvé' });

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