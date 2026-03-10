/**
 * Cloudinary image optimization helper
 * Automatically adds optimization parameters to Cloudinary URLs
 */
export const getOptimizedImage = (url, width = 800) => {
    if (!url || !url.includes("cloudinary.com")) return url;

    // Transform URL: upload/v12345/image.jpg -> upload/f_auto,q_auto,w_800/v12345/image.jpg
    return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
};

export const getThumbnail = (url) => getOptimizedImage(url, 300);
export const getBanner = (url) => getOptimizedImage(url, 1200);
