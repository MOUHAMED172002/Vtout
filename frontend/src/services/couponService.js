import api from './api';

export const validateCoupon = async (code, amount, items) => {
    const { data } = await api.post('/coupons/validate', { code, amount, items });
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

export const updateCoupon = async (id, couponData, token) => {
    const { data } = await api.put(`/coupons/${id}`, couponData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const toggleCoupon = async (id, token) => {
    const { data } = await api.patch(`/coupons/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const deleteCoupon = async (id, token) => {
    const { data } = await api.delete(`/coupons/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const getCouponUsages = async (id, token) => {
    const { data } = await api.get(`/coupons/${id}/usages`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};
