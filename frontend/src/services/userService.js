import api from './api';

export const getMyProfile = async (token) => {
    const { data } = await api.get('/profiles/me', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const updateMyProfile = async (profileData, token) => {
    const { data } = await api.patch('/profiles/me', profileData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const getAllProfiles = async (token) => {
    const { data } = await api.get('/profiles', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const getProfileById = async (id, token) => {
    const { data } = await api.get(`/profiles/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const updateProfileStatus = async (id, isActive, token) => {
    const { data } = await api.patch(`/profiles/${id}/status`, { is_active: isActive }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};
export const switchRole = async (newRole, token) => {
    const { data } = await api.post('/profiles/switch-role', { newRole }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};
