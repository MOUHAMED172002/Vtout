const { Policy } = require('../models');

exports.getAllPolicies = async (req, res) => {
    try {
        const policies = await Policy.findAll();
        res.json(policies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPoliciesByType = async (req, res) => {
    try {
        const { type } = req.params;
        const policies = await Policy.findAll({ where: { type } });
        res.json(policies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createPolicy = async (req, res) => {
    try {
        const policy = await Policy.create(req.body);
        res.status(201).json(policy);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updatePolicy = async (req, res) => {
    try {
        const { id } = req.params;
        await Policy.update(req.body, { where: { id } });
        res.json({ message: 'Policy updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deletePolicy = async (req, res) => {
    try {
        const { id } = req.params;
        await Policy.destroy({ where: { id } });
        res.json({ message: 'Policy deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
