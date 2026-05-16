import express from 'express';
import * as authWhatsAppController from '../controllers/authWhatsAppController.js';

const router = express.Router();

// Demander un code
router.post('/send-code', authWhatsAppController.requestWhatsAppOTP);

// Vérifier le code et se connecter
router.post('/verify-code', authWhatsAppController.verifyWhatsAppOTP);

// Réinitialiser le mot de passe
router.post('/reset-password', authWhatsAppController.resetWhatsAppPassword);

export default router;
