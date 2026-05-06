import { Config } from '../models/index.js';
import { sendTestEmail } from '../services/mailService.js';


import { Op } from 'sequelize';

export const getPublicConfigs = async (req, res) => {
    try {
        // Exclure les clés sensibles
        const configs = await Config.findAll({
            where: {
                group: {
                    [Op.notIn]: ['cloudinary', 'whatsapp', 'secrets']
                }
            }
        });
        res.json(configs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllConfigs = async (req, res) => {
    try {
        const configs = await Config.findAll();
        res.json(configs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getConfigsByGroup = async (req, res) => {
    try {
        const { group } = req.params;
        const configs = await Config.findAll({ where: { group } });
        res.json(configs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getConfigByKey = async (req, res) => {
    try {
        const { key } = req.params;
        const config = await Config.findOne({ where: { key } });
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const upsertConfig = async (req, res) => {
    try {
        const { key, value, group, description } = req.body;
        const [config, created] = await Config.findOrCreate({ where: { key }, defaults: { value, group, description } });
        if (!created) {
            await config.update({ value, group, description });
        }
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteConfig = async (req, res) => {
    try {
        const { key } = req.params;
        await Config.destroy({ where: { key } });
        res.json({ message: 'Config deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const testEmailConfig = async (req, res) => {
    try {
        const { to } = req.body;
        if (!to) return res.status(400).json({ error: 'Email destinataire requis' });
        const result = await sendTestEmail(to);
        if (result.success) {
            res.json({ success: true, message: `Email de test envoyé à ${to}` });
        } else {
            res.status(500).json({ success: false, error: String(result.error) });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};