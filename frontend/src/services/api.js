import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const normalizedBaseUrl = rawBaseUrl.replace(/\/+$|\/api\/?$/, (match) => match.startsWith('/') ? '/api' : '/api');
const baseURL = normalizedBaseUrl.endsWith('/api') ? normalizedBaseUrl : `${normalizedBaseUrl}/api`;

const api = axios.create({
    baseURL,
    withCredentials: true,
});

export default api;
