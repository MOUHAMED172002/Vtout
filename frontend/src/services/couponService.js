import api from './api';

export const validateCoupon = async (code, amount) => {
    const { data } = await api.post('/coupons/validate', { code, amount });
    return data;
};

export const getAllCoupons = async (token) => {
    const { data } = await api.get('/coupons', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const createCoupon = async (couponData, token) => {
    const { data } = await api.post('/coupons', couponData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};
