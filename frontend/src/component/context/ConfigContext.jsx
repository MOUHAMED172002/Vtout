import React, { createContext, useContext, useState, useEffect } from "react";
import { getAllConfigs } from "../../services/configService";

const ConfigContext = createContext();

export function ConfigProvider({ children }) {
    const [configs, setConfigs] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            const data = await getAllConfigs();
            const map = {};
            data.forEach(c => map[c.key] = c.value);
            setConfigs(map);
        } catch (err) {
            console.error("ConfigProvider: error loading configs", err);
        } finally {
            setLoading(false);
        }
    };

    const getConfig = (key, defaultValue = "") => {
        return configs[key] || defaultValue;
    };

    return (
        <ConfigContext.Provider value={{ configs, getConfig, refreshConfigs: fetchConfigs, loading }}>
            {children}
        </ConfigContext.Provider>
    );
}

export const useAppConfig = () => useContext(ConfigContext);
