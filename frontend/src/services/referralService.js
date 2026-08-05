import api from './api';

export const getMyReferralInfo = async (token) => {
    const { data } = await api.get('/referrals/me', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const applyReferralCode = async (code, token) => {
    const { data } = await api.post('/referrals/apply', { code }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

// Admin
export const getReferralSettings = async (token) => {
    const { data } = await api.get('/referrals/admin/settings', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const updateReferralSettings = async (settings, token) => {
    const { data } = await api.patch('/referrals/admin/settings', settings, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const getAllReferrals = async (token) => {
    const { data } = await api.get('/referrals/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const getReferralStats = async (token) => {
    const { data } = await api.get('/referrals/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};
