const { Config } = require('../models');

exports.getAllConfigs = async (req, res) => {
    try {
        const configs = await Config.findAll();
        res.json(configs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getConfigsByGroup = async (req, res) => {
    try {
        const { group } = req.params;
        const configs = await Config.findAll({ where: { group } });
        res.json(configs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getConfigByKey = async (req, res) => {
    try {
        const { key } = req.params;
        const config = await Config.findOne({ where: { key } });
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.upsertConfig = async (req, res) => {
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

exports.deleteConfig = async (req, res) => {
    try {
        const { key } = req.params;
        await Config.destroy({ where: { key } });
        res.json({ message: 'Config deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
