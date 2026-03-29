const { Profile } = require('../models');
const crypto = require('crypto');

exports.syncProfile = async (req, res) => {
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

exports.getMe = async (req, res) => {
    try {
        const { userId } = req.auth;
        if (!userId) return res.status(404).json({ error: 'Profil non trouvé' });
        const profile = await Profile.findByPk(userId);
        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

exports.updateMe = async (req, res) => {
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

exports.getAllProfiles = async (req, res) => {
    try {
        const profiles = await Profile.findAll();
        res.json(profiles);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des profils' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const profile = await Profile.findByPk(id);
        if (!profile) return res.status(404).json({ error: 'Profil non trouvé' });
        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

exports.updateProfileStatus = async (req, res) => {
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
