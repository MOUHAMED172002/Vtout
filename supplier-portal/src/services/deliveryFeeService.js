import api from './api';

/**
 * Fetches the delivery fee tiers from the configuration API.
 * Tiers are expected to be an array of { min, max, fee }.
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
    // Fallback to a default 1000 F tier if API fails
    return [{ min: 0, max: 9999999, fee: 1000 }];
};

/**
 * Calculates the delivery fee based on the supplier price.
 */
export const computeDeliveryFee = (supplierPrice, tiers) => {
    const price = parseFloat(supplierPrice) || 0;
    if (price === 0) return 1000; // Default

    const tier = tiers.find(t => price >= t.min && price <= t.max);
    return tier ? tier.fee : 1000;
};

/**
 * Calculates the final public price (Supplier Price + Delivery Fee).
 */
export const computePublicPrice = (supplierPrice, tiers) => {
    const fee = computeDeliveryFee(supplierPrice, tiers);
    return (parseFloat(supplierPrice) || 0) + fee;
};
