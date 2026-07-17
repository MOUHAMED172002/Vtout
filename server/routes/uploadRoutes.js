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

// Middleware pour valider les images
const validateImage = (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ 
            error: 'Aucun fichier téléchargé',
            code: 'NO_FILE'
        });
    }

    // Vérifier la taille (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
        return res.status(400).json({ 
            error: 'Le fichier est trop volumineux (maximum 5MB)',
            code: 'FILE_TOO_LARGE',
            size: req.file.size,
            maxSize
        });
    }

    // Vérifier les formats autorisés
    const allowedFormats = ['jpg', 'png', 'jpeg', 'webp'];
    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
    
    if (!allowedFormats.includes(fileExtension)) {
        return res.status(400).json({ 
            error: 'Format d\'image non autorisé. Utilisez JPG, PNG ou WebP',
            code: 'INVALID_FORMAT',
            format: fileExtension,
            allowed: allowedFormats
        });
    }

    next();
};

// Route pour uploader une seule image
router.post('/single', requireAuth, ensureCloudinaryConfig, upload.single('image'), validateImage, (req, res) => {
    try {
        console.log(`[upload/single] User: ${req.auth?.userId}`);
        console.log(`[upload/single] File size: ${req.file.size} bytes`);
        console.log(`[upload/single] File type: ${req.file.mimetype}`);
        
        res.json({ 
            success: true,
            url: req.file.path,
            message: 'Image uploadée avec succès !',
            details: {
                filename: req.file.originalname,
                size: req.file.size,
                width: req.file.width,
                height: req.file.height
            }
        });
    } catch (error) {
        console.error('[upload/single] Error:', error);
        res.status(500).json({ 
            error: 'Erreur lors de l\'upload',
            code: 'UPLOAD_ERROR',
            details: error.message
        });
    }
});

// Route pour uploader plusieurs images
router.post('/multiple', requireAuth, requireFournisseur, ensureCloudinaryConfig, upload.array('images', 5), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ 
                error: 'Aucun fichier téléchargé',
                code: 'NO_FILES'
            });
        }

        // Vérifier la taille totale
        const totalSize = req.files.reduce((sum, file) => sum + file.size, 0);
        const maxTotalSize = 20 * 1024 * 1024; // 20MB au total

        if (totalSize > maxTotalSize) {
            return res.status(400).json({ 
                error: 'Taille totale des fichiers trop importante (maximum 20MB)',
                code: 'TOTAL_SIZE_EXCEEDED',
                totalSize,
                maxTotalSize
            });
        }

        const urls = req.files.map(file => file.path);
        console.log(`[upload/multiple] Uploaded ${urls.length} images, total size: ${totalSize} bytes`);
        
        res.json({ 
            success: true,
            urls,
            message: `${req.files.length} image(s) uploadée(s) avec succès !`,
            count: req.files.length
        });
    } catch (error) {
        console.error('[upload/multiple] Error:', error);
        res.status(500).json({ 
            error: 'Erreur lors de l\'upload multiple',
            code: 'MULTI_UPLOAD_ERROR'
        });
    }
});

export default router;
