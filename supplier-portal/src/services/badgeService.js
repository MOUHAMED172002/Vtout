import api from './api';

export const getBadgePrice = async (token) => {
    const { data } = await api.get('/badge/price', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return data;
};

export const getMyBadgeStatus = async (token) => {
    const { data } = await api.get('/badge/me', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return data;
};

export const subscribeToBadge = async (token, months = 1) => {
    const { data } = await api.post('/badge/subscribe', { months }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return data;
};
