import { Policy } from '../models/index.js';


export const getAllPolicies = async (req, res) => {
    try {
        const policies = await Policy.findAll();
        res.json(policies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getPoliciesByType = async (req, res) => {
    try {
        const { type } = req.params;
        const policies = await Policy.findAll({ where: { type } });
        res.json(policies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createPolicy = async (req, res) => {
    try {
        const policy = await Policy.create(req.body);
        res.status(201).json(policy);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updatePolicy = async (req, res) => {
    try {
        const { id } = req.params;
        await Policy.update(req.body, { where: { id } });
        res.json({ message: 'Policy updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deletePolicy = async (req, res) => {
    try {
        const { id } = req.params;
        await Policy.destroy({ where: { id } });
        res.json({ message: 'Policy deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};