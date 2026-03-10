import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const getPoliciesByType = async (type) => {
    const res = await axios.get(`${API_URL}/policies/type/${type}`);
    return res.data;
};
