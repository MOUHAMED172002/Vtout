import api from './api';

export const getSuppliers = async (token) => {
    const { data } = await api.get('/suppliers', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return data;
};

export const getAllSupplierProducts = async (token) => {
    const { data } = await api.get('/suppliers/products', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return data;
};

export const getMySupplierProducts = async (token) => {
    const { data } = await api.get('/suppliers/me/products', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return data;
};

export const updateSupplierStatus = async (id, statusData, token) => {
    const { data } = await api.patch(`/suppliers/${id}`, statusData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return data;
};

export const updateSupplierProductStatus = async (productId, statusData, token) => {
    const { data } = await api.put(`/products/${productId}`, statusData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return data;
};
export const getMySupplierProfile = async (token) => {
    const { data } = await api.get('/suppliers/me', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return data;
};

export const getMyBoutiques = async (token) => {
    const { data } = await api.get('/suppliers/me/boutiques', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return data;
};

export const getAllBoutiques = async (token) => {
    const { data } = await api.get('/suppliers/boutiques-all', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return data;
};

export const createSupplier = async (supplierData, token) => {
    const { data } = await api.post('/suppliers', supplierData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return data;
};

export const registerSelfSupplier = async (supplierData, token) => {
    const { data } = await api.post('/suppliers/register', supplierData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return data;
};

export const updateMySupplierProfile = async (supplierData, token) => {
    const { data } = await api.patch('/suppliers/me', supplierData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return data;
};
export const updateSupplierProduct = async (id, data, token) => {
    const resp = await api.patch(`/suppliers/products/${id}`, data, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return resp.data;
};

export const deleteSupplierProduct = async (id, token) => {
    const resp = await api.delete(`/suppliers/products/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return resp.data;
};
export const deleteSupplier = async (id, token) => {
    const resp = await api.delete(`/suppliers/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return resp.data;
};

export const notifyIncompleteSuppliers = async (token) => {
    const { data } = await api.post('/suppliers/notify-incomplete', {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return data;
};
