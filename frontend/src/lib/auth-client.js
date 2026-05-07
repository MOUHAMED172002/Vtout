import { createAuthClient } from 'better-auth/react';

let API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
if (API_BASE_URL.startsWith('/')) {
    API_BASE_URL = window.location.origin + API_BASE_URL;
}

export const authClient = createAuthClient({
    baseURL: API_BASE_URL + '/auth',
    plugins: []
});
