import express from 'express';
import { upload, refreshCloudinaryConfig } from '../config/cloudinary.js';
import { requireAuth, requireAdmin, requireFournisseur } from '../middleware/authMiddleware.js';

const router = express.Router();

const ensureCloudinaryConfig = async (req, res, next) => {
    try {
        await refreshCloudinaryConfig();
    } catch (e) {
        console.error('Cloudinary config error:', e);
    }
    next();
};

// Route pour uploader une seule image
router.post('/single', requireAuth, ensureCloudinaryConfig, upload.single('image'), (req, res) => {
    try {
        console.log(`[upload/single] User: ${req.auth?.userId}`);
        if (!req.file) {
            console.warn('[upload/single] No file in request');
            return res.status(400).json({ error: 'Aucun fichier téléchargé' });
        }
        console.log(`[upload/single] Uploaded to Cloudinary: ${req.file.path}`);
        res.json({ url: req.file.path });
    } catch (error) {
        console.error('[upload/single] Error:', error);
        res.status(500).json({ error: 'Erreur lors de l\'upload' });
    }
});

// Route pour uploader plusieurs images
router.post('/multiple', requireAuth, requireFournisseur, ensureCloudinaryConfig, upload.array('images', 5), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'Aucun fichier téléchargé' });
        }
        const urls = req.files.map(file => file.path);
        res.json({ urls });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l\'upload multiple' });
    }
});

export default router;