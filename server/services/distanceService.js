import axios from 'axios';

/**
 * Calcule la distance routière entre deux points via OSRM (Données OpenStreetMap)
 * @param {number} lat1 Latitude Source
 * @param {number} lon1 Longitude Source
 * @param {number} lat2 Latitude Destination
 * @param {number} lon2 Longitude Destination
 * @returns {Promise<number>} Distance en Kilomètres
 */
export const getRoadDistance = async (lat1, lon1, lat2, lon2) => {
    try {
        // Utilisation du serveur de démo public OSRM (Gratuit)
        // Format : lon1,lat1;lon2,lat2
        const url = `http://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`;
        
        const response = await axios.get(url, { timeout: 5000 });
        
        if (response.data && response.data.routes && response.data.routes[0]) {
            // La distance est renvoyée en mètres
            const distanceInMeters = response.data.routes[0].distance;
            return distanceInMeters / 1000;
        }
        
        throw new Error("No route found");
    } catch (error) {
        console.warn("[DistanceService] OSRM Failed, using Haversine fallback:", error.message);
        return calculateHaversineDistance(lat1, lon1, lat2, lon2);
    }
};

/**
 * Calcul de secours (Ligne droite) si l'API est indisponible
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Calcule les frais de livraison basés sur la distance
 * Formule Pro : Base + (KM * Prix_KM)
 */
export const calculateDeliveryFee = (distanceKm) => {
    const BASE_FEE = 500;   // Frais fixes de prise en charge
    const PRICE_PER_KM = 100; // 100 FCFA par kilomètre
    
    // On arrondit au kilomètre supérieur pour le calcul
    const total = BASE_FEE + (Math.ceil(distanceKm) * PRICE_PER_KM);
    
    // Optionnel : Minimum 1000 FCFA
    return Math.max(1000, total);
};
