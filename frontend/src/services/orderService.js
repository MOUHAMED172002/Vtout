import api from './api';

export const getMyOrders = async (token) => {
    const { data } = await api.get('/orders/me', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const getMySupplierOrders = async (token) => {
    const { data } = await api.get('/orders/me/supplier', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const getAllOrders = async (token) => {
    const { data } = await api.get('/orders', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const getOrderById = async (id, token) => {
    const { data } = await api.get(`/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const createOrder = async (orderData, token = null) => {
    try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const { data } = await api.post('/orders', orderData, { headers });
        return data;
    } catch (error) {
        console.error("Server responded with 500:", JSON.stringify(error.response?.data));
        throw error;
    }
};

export const updateOrderStatus = async (orderId, statusData, token = null) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.put(`/orders/${orderId}/status`, statusData, { headers });
    return data;
};

export const getSuggestedSuppliers = async (id, token) => {
    const { data } = await api.get(`/orders/${id}/suggested-suppliers`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const assignSupplier = async (id, supplierId, token) => {
    const { data } = await api.put(`/orders/${id}/assign-supplier`, { supplier_id: supplierId }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};
