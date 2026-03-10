import api from './api';

/**
 * Uploade une seule image
 * @param {File} file - Le fichier à uploader
 * @param {string} token - Token d'authentification Clerk
 */
export const uploadSingleImage = async (file, token) => {
    const formData = new FormData();
    formData.append('image', file);

    const { data } = await api.post('/upload/single', formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
    });
    return data.url; // Retourne l'URL Cloudinary
};

/**
 * Uploade plusieurs images (max 5)
 * @param {File[]} files - Tableau de fichiers
 * @param {string} token - Token d'authentification Clerk
 */
export const uploadMultipleImages = async (files, token) => {
    const formData = new FormData();
    files.forEach((file) => {
        formData.append('images', file);
    });

    const { data } = await api.post('/upload/multiple', formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
    });
    return data.urls; // Retourne un tableau d'URLs
};
