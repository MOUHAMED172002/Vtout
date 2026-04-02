/**
 * Logistics Service
 * Handles distance calculation, delivery fees, and automated assignments
 */

const { Supplier, SupplierProduct, DeliveryPerson, Profile } = require('../models');

// Geocoordinates for base calculation (Center of Cotonou and AB-Calavi)
const COTONOU_LAT = 6.3667;
const COTONOU_LNG = 2.4333;
const CALAVI_LAT = 6.4485;
const CALAVI_LNG = 2.3557;

// Free Zones (Communes or Departments)
const FREE_ZONES = [
    'COTONOU', 
    'LITTORAL', 
    'LITORAL', // handle spelling variation
    'ABOMEY-CALAVI', 
    'ABOMEY CALAVI',
    'PORTO-NOVO', 
    'PORTO NOVO',
    'SEME-PODJI', 
    'SEME',
    'SEME PODJI'
];

/**
 * Haversine Formula for distance between two points in km
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    
    const R = 6371; // Earth Radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

// Calculate the base distance for 500 FCFA
const BASE_DISTANCE = calculateDistance(COTONOU_LAT, COTONOU_LNG, CALAVI_LAT, CALAVI_LNG); // ~12-15km
const BASE_PRICE = 500;

/**
 * Check if a location qualifies for free delivery
 */
const isFreeDelivery = (address) => {
    const commune = (address.commune_label || '').toUpperCase();
    const department = (address.departement_label || '').toUpperCase();
    const quartier = (address.quartier_label || '').toUpperCase();

    return FREE_ZONES.some(zone => 
        commune.includes(zone) || 
        department.includes(zone) ||
        quartier.includes(zone)
    );
};

/**
 * Calculate Fee based on distance
 */
const calculateFee = (distance, address) => {
    if (isFreeDelivery(address)) return 0;
    if (distance === Infinity) return BASE_PRICE; // Fallback

    const fee = (distance / BASE_DISTANCE) * BASE_PRICE;
    // Round to nearest 25 or 50 if desired, otherwise just round.
    return Math.max(500, Math.ceil(fee / 25) * 25); // Minimum 500 if not free
};

/**
 * Find the optimal supplier for a specific product based on client position
 */
const findOptimalSupplier = async (productId, clientLat, clientLng) => {
    const sellers = await Supplier.findAll({
        include: [{
            model: SupplierProduct,
            as: 'suppliedProducts',
            where: { product_id: productId },
            required: true
        }],
        where: { status: 'active' }
    });

    if (!sellers || sellers.length === 0) return null;

    let closest = null;
    let minDistance = Infinity;

    sellers.forEach(s => {
        const dist = calculateDistance(clientLat, clientLng, s.lat, s.lng);
        if (dist < minDistance) {
            minDistance = dist;
            closest = s;
        }
    });

    return { supplier: closest, distance: minDistance };
};

/**
 * Find the closest available delivery person
 */
const findClosestLivreur = async (originLat, originLng) => {
    const livreurs = await DeliveryPerson.findAll({
        where: { 
            status: 'disponible', 
            is_active: true,
            is_verified: true
        },
        include: [{ 
            model: Profile, 
            as: 'profile', 
            attributes: ['id', 'fullname', 'phone'] 
        }]
    });

    if (!livreurs || livreurs.length === 0) return null;

    let closest = null;
    let minDistance = Infinity;

    livreurs.forEach(l => {
        // If driver hasn't shared location, they might be skipped or put at bottom
        if (!l.lat || !l.lng) return;

        const dist = calculateDistance(originLat, originLng, l.lat, l.lng);
        if (dist < minDistance) {
            minDistance = dist;
            closest = l;
        }
    });

    return { livreur: closest, distance: minDistance };
};

module.exports = {
    calculateDistance,
    isFreeDelivery,
    calculateFee,
    findOptimalSupplier,
    findClosestLivreur,
    BASE_DISTANCE
};
