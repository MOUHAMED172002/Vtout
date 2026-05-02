import 'dotenv/config';
import cloudinaryModule from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

import { Config } from '../models/index.js';

const cloudinary = cloudinaryModule.v2;

/**
 * Fonction pour rafraîchir la config Cloudinary à partir de la DB
 */
export const refreshCloudinaryConfig = async () => {
    try {
        const configs = await Config.findAll({
            where: { group: 'cloudinary' }
        });
        
        const configMap = {};
        configs.forEach(c => {
            configMap[c.key] = c.value;
        });

        const cloud_name = configMap['CLOUDINARY_CLOUD_NAME'] || process.env.CLOUDINARY_CLOUD_NAME;
        const api_key = configMap['CLOUDINARY_API_KEY'] || process.env.CLOUDINARY_API_KEY;
        const api_secret = configMap['CLOUDINARY_API_SECRET'] || process.env.CLOUDINARY_API_SECRET;

        if (cloud_name && api_key && api_secret) {
            cloudinary.config({
                cloud_name,
                api_key,
                api_secret
            });
            console.log(`[Cloudinary] Config rafraîchie : ${cloud_name}`);
        }
    } catch (err) {
        console.error('[Cloudinary] Erreur rafraîchissement config:', err.message);
        // Fallback to env
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }
};

// Init par défaut au démarrage
refreshCloudinaryConfig();

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'eshop',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
    },
});

const upload = multer({ storage: storage });

export { cloudinary, upload };
