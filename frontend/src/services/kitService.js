import api from './api';

export const getKits = async (params = {}) => {
    const { data } = await api.get('/kits', { params });
    return data;
};

export const getKitById = async (id) => {
    const { data } = await api.get(`/kits/${id}`);
    return data;
};

export const createKit = async (kitData, token) => {
    const { data } = await api.post('/kits', kitData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const updateKit = async (id, kitData, token) => {
    const { data } = await api.put(`/kits/${id}`, kitData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const deleteKit = async (id, token) => {
    const { data } = await api.delete(`/kits/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};
