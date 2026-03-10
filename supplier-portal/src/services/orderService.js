import api from './api';

export const getMySupplierOrders = async (token) => {
    const { data } = await api.get('/orders/me/supplier', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return data;
};
