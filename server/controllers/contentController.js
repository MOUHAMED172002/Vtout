const { Faq, Policy } = require('../models');

// FAQ
exports.getAllFaqs = async (req, res) => {
    try {
        const faqs = await Faq.findAll({ order: [['id', 'DESC']] });
        res.json(faqs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createFaq = async (req, res) => {
    try {
        const faq = await Faq.create(req.body);
        res.status(201).json(faq);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateFaq = async (req, res) => {
    try {
        await Faq.update(req.body, { where: { id: req.params.id } });
        res.json({ message: 'FAQ mise à jour' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteFaq = async (req, res) => {
    try {
        await Faq.destroy({ where: { id: req.params.id } });
        res.json({ message: 'FAQ supprimée' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Polices
exports.getAllPolicies = async (req, res) => {
    try {
        const policies = await Policy.findAll({ order: [['id', 'DESC']] });
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
        await Policy.update(req.body, { where: { id: req.params.id } });
        res.json({ message: 'Politique mise à jour' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deletePolicy = async (req, res) => {
    try {
        await Policy.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Politique supprimée' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
