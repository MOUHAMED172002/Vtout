import { cloudinary, refreshCloudinaryConfig } from '../config/cloudinary.js';

// Les captures d'écran de statut WhatsApp doivent être hashées (anti-fraude,
// voir adFraudService.js) AVANT l'upload — on a donc besoin du buffer brut en
// mémoire, contrairement au reste de l'app qui passe par multer-storage-cloudinary
// (upload direct en streaming, sans buffer exploitable côté serveur).
export async function uploadBufferToCloudinary(buffer, folder = 'eshop/ad_submissions') {
    await refreshCloudinaryConfig();
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'image' },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        stream.end(buffer);
    });
}
