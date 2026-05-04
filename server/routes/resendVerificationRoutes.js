import express from 'express';
import sequelize from '../config/database.js';
import { Profile } from '../models/index.js';
import { sendEmailVerification } from '../services/mailService.js';
import { authMiddleware, requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * POST /api/resend-verification
 * Permet à un utilisateur connecté de demander le renvoi du mail de vérification.
 */
router.post('/', authMiddleware, requireAuth, async (req, res) => {
    try {
        const email = req.auth.email;
        if (!email) {
            return res.status(400).json({ error: 'Email introuvable dans la session.' });
        }

        const profile = await Profile.findOne({ where: { email } });
        if (!profile) {
            return res.status(404).json({ error: 'Profil introuvable.' });
        }

        if (profile.email_verified) {
            return res.status(400).json({ message: 'Email déjà vérifié.' });
        }

        // Vérification anti-spam : ne pas envoyer plus d'un email toutes les 2 minutes
        const [existingToken] = await sequelize.query(
            `SELECT id FROM verification WHERE identifier = :email AND expiresAt > DATE_ADD(NOW(), INTERVAL 23 HOUR) AND expiresAt <= DATE_ADD(NOW(), INTERVAL 24 HOUR) LIMIT 1`,
            { replacements: { email }, type: sequelize.QueryTypes.SELECT }
        ).catch(() => []);

        if (existingToken) {
            return res.status(429).json({ error: 'Un email a déjà été envoyé récemment. Veuillez patienter.' });
        }

        // Envoi de l'email
        await sendEmailVerification(profile);

        return res.json({ success: true, message: 'Email de vérification envoyé avec succès.' });
    } catch (err) {
        console.error('[ResendVerification] Error:', err.message);
        return res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email.' });
    }
});

export default router;
