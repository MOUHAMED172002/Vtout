import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Hook to retrieve all or specific parts of the store configuration.
 * Automatically handles caching to avoid redundant requests.
 */
let settingsCache = null;

export const useSettings = () => {
    const [settings, setSettings] = useState(settingsCache || {});
    const [loading, setLoading] = useState(!settingsCache);

    useEffect(() => {
        if (settingsCache) return;

        const fetchSettings = async () => {
            try {
                const res = await axios.get(`${API_URL}/configs/public`);
                const data = res.data.reduce((acc, curr) => {
                    acc[curr.key] = curr.value;
                    return acc;
                }, {});
                settingsCache = data;
                setSettings(data);
            } catch (error) {
                console.error("Failed to load settings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    // Helper to get a setting with a default value
    const get = (key, defaultValue = '') => settings[key] || defaultValue;

    return { settings, loading, get };
};
