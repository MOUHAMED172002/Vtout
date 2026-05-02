import { Otp, Profile, sequelize } from '../models/index.js';
import { sendWhatsAppMessage } from '../services/whatsappService.js';
import { auth } from '../config/auth.js';
import { Op } from 'sequelize';
import crypto from 'crypto';
import fs from 'fs';

/**
 * Demander un code de vérification via Twilio Programmable Messaging (WhatsApp Sandbox)
 */
export const requestWhatsAppOTP = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ error: 'Numéro WhatsApp requis' });

        // Nettoyage du numéro
        const cleanPhone = phone.replace(/\D/g, '');
        
        // Génération code 6 chiffres
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Sauvegarde en DB
        await Otp.create({
            phone: cleanPhone,
            code,
            expires_at: expiresAt
        });

        // Message personnalisé
        const messageBody = `Vtout - Votre code de connexion est : *${code}*. Ne le partagez avec personne.`;

        // Envoi via Programmable Messaging (plus simple pour le Sandbox)
        const result = await sendWhatsAppMessage(phone, messageBody);

        if (!result.success) {
            return res.status(400).json({ 
                error: 'Échec de l\'envoi du code', 
                message: result.error 
            });
        }

        res.json({ message: 'Code envoyé avec succès', phone: cleanPhone });
    } catch (error) {
        console.error('[AuthWhatsApp] Error requesting OTP:', error);
        res.status(500).json({ error: 'Erreur interne', message: error.message });
    }
};

/**
 * Vérifier le code et connecter l'utilisateur
 */
export const verifyWhatsAppOTP = async (req, res) => {
    try {
        const { phone, code, name } = req.body;
        if (!phone || !code) return res.status(400).json({ error: 'Téléphone et code requis' });

        const cleanPhone = phone.replace(/\D/g, '');

        // Vérification du code en DB
        const otpEntry = await Otp.findOne({
            where: {
                phone: cleanPhone,
                code: code,
                is_used: false,
                expires_at: { [Op.gt]: new Date() }
            },
            order: [['createdAt', 'DESC']]
        });

        if (!otpEntry) {
            return res.status(400).json({ 
                error: 'Vérification échouée', 
                message: 'Code invalide ou expiré' 
            });
        }

        // Marquer comme utilisé
        await otpEntry.update({ is_used: true });

        // Trouver ou créer l'utilisateur (sera géré par le frontend via Better-Auth)
        // La création de compte, de session et la synchronisation avec Better Auth 
        // est désormais gérée proprement depuis le frontend avec signUp.email
        
        res.json({ message: 'Code vérifié avec succès, procédez à la création de compte' });
    } catch (error) {
        console.error('[AuthWhatsApp] Error verifying OTP:', error);
        try { fs.writeFileSync('whatsapp_debug_error.log', error.stack || error.message); } catch (e) {}
        res.status(500).json({ error: 'Erreur interne', message: error.message });
    }
};
