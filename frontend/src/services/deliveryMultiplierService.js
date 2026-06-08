import axios from 'axios';
const API = import.meta.env.VITE_API_URL || '';

export const getMultiplierTiers = async (token) => {
    const res = await axios.get(`${API}/api/admin/delivery-multiplier-tiers`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data.tiers;
};

export const updateMultiplierTiers = async (tiers, token) => {
    const res = await axios.put(`${API}/api/admin/delivery-multiplier-tiers`, { tiers }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};
