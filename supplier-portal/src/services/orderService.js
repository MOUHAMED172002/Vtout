import api from './api';

export const getMySupplierOrders = async (token) => {
    const { data } = await api.get('/orders/me/supplier', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return data;
};

export const updateOrderStatus = async (orderId, statusData, token) => {
    const { data } = await api.put(`/orders/${orderId}/status`, statusData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return data;
};
