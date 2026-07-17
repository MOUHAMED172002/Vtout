import api from './api';
import toast from 'react-hot-toast';

/**
 * Uploade une seule image avec gestion complète des erreurs et toasts
 * @param {File} file - Le fichier à uploader
 * @param {string} token - Token d'authentification Clerk
 */
export const uploadSingleImage = async (file, token) => {
    // Validation préalable au client
    if (!file) {
        toast.error('Aucun fichier sélectionné');
        throw new Error('Aucun fichier sélectionné');
    }

    // Vérifier la taille (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        const maxMB = (maxSize / (1024 * 1024)).toFixed(0);
        toast.error(`Fichier trop volumineux: ${sizeMB}MB (max ${maxMB}MB)`);
        throw new Error('Fichier trop volumineux');
    }

    // Vérifier le format
    const allowedFormats = ['jpg', 'png', 'jpeg', 'webp'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!allowedFormats.includes(fileExtension)) {
        toast.error(`Format non autorisé: ${fileExtension.toUpperCase()}`);
        throw new Error('Format non autorisé');
    }

    // Toast de chargement
    const toastId = toast.loading('📤 Envoi de l\'image...');

    try {
        const formData = new FormData();
        formData.append('image', file);

        const { data } = await api.post('/upload/single', formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });

        // Afficher le succès avec détails
        if (data.success) {
            toast.success(
                (t) => (
                    <div className="space-y-1">
                        <p className="font-bold">✅ {data.message}</p>
                        <p className="text-xs opacity-80">
                            {(data.details?.size / (1024 * 1024)).toFixed(2)}MB • {fileExtension.toUpperCase()}
                        </p>
                    </div>
                ),
                { id: toastId }
            );
        }

        return data.url;
    } catch (error) {
        // Gestion des erreurs du serveur
        const errorData = error.response?.data;
        let errorMessage = 'Erreur lors de l\'upload';

        if (errorData) {
            switch (errorData.code) {
                case 'NO_FILE':
                    errorMessage = '❌ Aucun fichier détecté';
                    break;
                case 'FILE_TOO_LARGE':
                    const maxMB = (errorData.maxSize / (1024 * 1024)).toFixed(0);
                    const actualMB = (errorData.size / (1024 * 1024)).toFixed(2);
                    errorMessage = `❌ Fichier trop volumineux: ${actualMB}MB (max ${maxMB}MB)`;
                    break;
                case 'INVALID_FORMAT':
                    errorMessage = `❌ Format "${errorData.format.toUpperCase()}" non autorisé. Utilisez: ${errorData.allowed.join(', ').toUpperCase()}`;
                    break;
                case 'UPLOAD_ERROR':
                    errorMessage = `❌ Erreur d'upload: ${errorData.details || 'Veuillez réessayer'}`;
                    break;
                default:
                    errorMessage = errorData.error || errorMessage;
            }
        } else if (error.code === 'ERR_NETWORK') {
            errorMessage = '❌ Erreur réseau - Vérifiez votre connexion';
        }

        toast.error(errorMessage, { id: toastId });
        console.error('[uploadSingleImage] Error:', error);
        throw error;
    }
};

/**
 * Uploade plusieurs images (max 5) avec gestion complète des erreurs
 * @param {File[]} files - Tableau de fichiers
 * @param {string} token - Token d'authentification Clerk
 */
export const uploadMultipleImages = async (files, token) => {
    if (!files || files.length === 0) {
        toast.error('Aucun fichier sélectionné');
        throw new Error('Aucun fichier sélectionné');
    }

    if (files.length > 5) {
        toast.error('Maximum 5 images autorisées');
        throw new Error('Trop d\'images');
    }

    // Valider chaque fichier
    const allowedFormats = ['jpg', 'png', 'jpeg', 'webp'];
    const maxSize = 5 * 1024 * 1024;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExtension = file.name.split('.').pop().toLowerCase();

        if (!allowedFormats.includes(fileExtension)) {
            toast.error(`Image ${i + 1}: Format "${fileExtension.toUpperCase()}" non autorisé`);
            throw new Error('Format non autorisé');
        }

        if (file.size > maxSize) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
            toast.error(`Image ${i + 1}: Trop volumineux (${sizeMB}MB)`);
            throw new Error('Fichier trop volumineux');
        }
    }

    // Toast de chargement
    const toastId = toast.loading(`📤 Envoi de ${files.length} image(s)...`);

    try {
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

        // Afficher le succès
        if (data.success) {
            const totalSize = files.reduce((sum, f) => sum + f.size, 0);
            toast.success(
                (t) => (
                    <div className="space-y-1">
                        <p className="font-bold">✅ {data.message}</p>
                        <p className="text-xs opacity-80">
                            {data.count} image(s) • {(totalSize / (1024 * 1024)).toFixed(2)}MB
                        </p>
                    </div>
                ),
                { id: toastId }
            );
        }

        return data.urls;
    } catch (error) {
        // Gestion des erreurs du serveur
        const errorData = error.response?.data;
        let errorMessage = 'Erreur lors de l\'upload multiple';

        if (errorData) {
            switch (errorData.code) {
                case 'NO_FILES':
                    errorMessage = '❌ Aucun fichier détecté';
                    break;
                case 'TOTAL_SIZE_EXCEEDED':
                    const maxMB = (errorData.maxTotalSize / (1024 * 1024)).toFixed(0);
                    const actualMB = (errorData.totalSize / (1024 * 1024)).toFixed(2);
                    errorMessage = `❌ Taille totale trop importante: ${actualMB}MB (max ${maxMB}MB)`;
                    break;
                case 'MULTI_UPLOAD_ERROR':
                    errorMessage = '❌ Erreur lors de l\'upload - Veuillez réessayer';
                    break;
                default:
                    errorMessage = errorData.error || errorMessage;
            }
        } else if (error.code === 'ERR_NETWORK') {
            errorMessage = '❌ Erreur réseau - Vérifiez votre connexion';
        }

        toast.error(errorMessage, { id: toastId });
        console.error('[uploadMultipleImages] Error:', error);
        throw error;
    }
};

/**
 * Fonction utilitaire pour formater la taille des fichiers
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
