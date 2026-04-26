import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true
});

export const getHierarchy = async () => {
    const res = await api.get('/locations/hierarchy');
    return res.data;
};

export const upsertLocation = async (locationData) => {
    const res = await api.post('/locations', locationData);
    return res.data;
};

export const deleteLocation = async (type, id) => {
    const res = await api.delete(`/locations/${type}/${id}`);
    return res.data;
};
