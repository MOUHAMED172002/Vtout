import api from './api';

const DEFAULT_TIERS = [
    { min: 0,     max: 500,    fee: 300  },
    { min: 500,   max: 2000,   fee: 500  },
    { min: 2000,  max: 5000,   fee: 700  },
    { min: 5000,  max: 15000,  fee: 1000 },
    { min: 15000, max: 1000000, fee: 1500 },
];

/**
 * Fetches the delivery fee tiers from the configuration API.
 */
export const getDeliveryFeeTiers = async () => {
    try {
        const response = await api.get('/configs/public');
        const tiersConfig = response.data.find(c => c.key === 'delivery_fee_tiers');
        if (tiersConfig && tiersConfig.value) {
            const tiers = typeof tiersConfig.value === 'string' 
                ? JSON.parse(tiersConfig.value) 
                : tiersConfig.value;
            return tiers.sort((a, b) => a.min - b.min);
        }
    } catch (error) {
        console.error("Error fetching delivery fee tiers:", error);
    }
    return DEFAULT_TIERS;
};

/**
 * Calculates the delivery fee based on the supplier price.
 */
export const computeDeliveryFee = (supplierPrice, tiers) => {
    const price = parseFloat(supplierPrice) || 0;
    if (price === 0) return 0;

    const currentTiers = (tiers && tiers.length > 0) ? tiers : DEFAULT_TIERS;
    const tier = currentTiers.find(t => price >= t.min && price < (t.max || Infinity));
    
    if (tier) return tier.fee;
    
    // Fallback if price is above the last max
    return currentTiers[currentTiers.length - 1]?.fee || 1000;
};

/**
 * Calculates the final public price (Supplier Price + Delivery Fee).
 */
export const computePublicPrice = (supplierPrice, tiers) => {
    const fee = computeDeliveryFee(supplierPrice, tiers);
    return (parseFloat(supplierPrice) || 0) + fee;
};
