import api from './api';

export const getDashboardStats = async (token, period = "30J") => {
    const { data } = await api.get('/stats/dashboard', {
        params: { period },
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};
