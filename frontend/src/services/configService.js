import api from './api';

export const getAllConfigs = async () => {
    const { data } = await api.get('/configs/public');
    return data;
};

export const getConfigsByGroup = async (group) => {
    const { data } = await api.get(`/configs/group/${group}`);
    return data;
};

export const upsertConfig = async (config, token) => {
    const { data } = await api.post('/configs/upsert', config, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const deleteConfig = async (key, token) => {
    const { data } = await api.delete(`/configs/${key}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const testEmailConfig = async (to, token) => {
    const { data } = await api.post('/configs/test-email', { to }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const testWhatsAppConfig = async (to, token) => {
    const { data } = await api.post('/configs/test-whatsapp', { to }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};
