import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const getAllConfigs = async () => {
    const res = await axios.get(`${API_URL}/configs`);
    return res.data;
};

export const getConfigsByGroup = async (group) => {
    const res = await axios.get(`${API_URL}/configs/group/${group}`);
    return res.data;
};

export const upsertConfig = async (config, token) => {
    const res = await axios.post(`${API_URL}/configs/upsert`, config, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const deleteConfig = async (key, token) => {
    const res = await axios.delete(`${API_URL}/configs/${key}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};
