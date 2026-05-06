import express from 'express';
import sequelize from '../config/database.js';
import { Profile } from '../models/index.js';

const router = express.Router();

/**
 * GET /api/verify-email?token=xxx&email=xxx
 * Called when the user clicks the verification link in their email.
 * Validates the token, marks email_verified = true, then redirects to frontend.
 */
router.get('/', async (req, res) => {
    const { token, email } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (!token || !email) {
        return res.redirect(`${frontendUrl}/auth/verify-email?status=invalid`);
    }

    try {
        // Look up token in verification table (case-insensitive email)
        const [row] = await sequelize.query(
            `SELECT * FROM verification WHERE LOWER(identifier) = LOWER(:email) AND value = :token AND expiresAt > NOW() LIMIT 1`,
            { replacements: { email, token }, type: sequelize.QueryTypes.SELECT }
        );

        if (!row) {
            return res.redirect(`${frontendUrl}/auth/verify-email?status=expired`);
        }

        // Mark email as verified in profiles table (case-insensitive)
        await sequelize.query(
            `UPDATE profiles SET email_verified = 1 WHERE LOWER(email) = LOWER(:email)`,
            { replacements: { email }, type: sequelize.QueryTypes.UPDATE }
        );

        // Also mark email verified in Better Auth's user table
        await sequelize.query(
            `UPDATE \`user\` SET emailVerified = 1 WHERE LOWER(email) = LOWER(:email)`,
            { replacements: { email }, type: sequelize.QueryTypes.UPDATE }
        ).catch(() => {});

        // Clean up used token
        await sequelize.query(
            `DELETE FROM verification WHERE LOWER(identifier) = LOWER(:email) AND value = :token`,
            { replacements: { email, token }, type: sequelize.QueryTypes.DELETE }
        ).catch(() => {});

        console.log(`[VerifyEmail] ✅ Email verified for: ${email}`);
        return res.redirect(`${frontendUrl}/auth/verify-email?status=success`);

    } catch (err) {
        console.error('[VerifyEmail] Error:', err.message);
        return res.redirect(`${frontendUrl}/auth/verify-email?status=error`);
    }
});

export default router;
