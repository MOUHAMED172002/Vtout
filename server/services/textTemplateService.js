import { Config } from '../models/index.js';

const formatTemplate = (template, params = {}) => {
    if (!template) return '';
    let result = String(template);
    Object.entries(params || {}).forEach(([key, value]) => {
        const safeValue = value === undefined || value === null ? '' : String(value);
        result = result.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), safeValue);
    });
    return result;
};

export const getTextTemplate = async (key, defaultTemplate, params = {}, group = 'messages') => {
    try {
        const config = await Config.findOne({ where: { key, group } });
        const template = config?.value || defaultTemplate;
        return formatTemplate(template, params);
    } catch (error) {
        console.error('[TextTemplateService] getTextTemplate error:', error.message);
        return formatTemplate(defaultTemplate, params);
    }
};

export const getTextConfig = async (key, defaultValue, group = 'messages') => {
    try {
        const config = await Config.findOne({ where: { key, group } });
        return config?.value ?? defaultValue;
    } catch (error) {
        console.error('[TextTemplateService] getTextConfig error:', error.message);
        return defaultValue;
    }
};
