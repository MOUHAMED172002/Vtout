/**
 * Haversine formula to calculate the distance between two points on the Earth
 * (in kilometers)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;
    return d; // Distance in kilometers
};

/**
 * Format distance in a human readable way
 */
export const formatDistance = (distKm) => {
    if (distKm < 1) {
        return Math.round(distKm * 1000) + " m";
    }
    return distKm.toFixed(1) + " km";
};

/**
 * Get Google Maps Direction external URL
 */
export const getGoogleMapsUrl = (originLat, originLng, destLat, destLng) => {
    return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=driving`;
};
