import { Faq, Policy, PlatformReview, Profile, Newsletter } from '../models/index.js';
import { v4 as  uuidv4 } from 'uuid';


// FAQ
export const getAllFaqs = async (req, res) => {
    try {
        const faqs = await Faq.findAll({ order: [['id', 'DESC']] });
        res.json(faqs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createFaq = async (req, res) => {
    try {
        const { question, answer } = req.body;
        if (!question?.trim() || !answer?.trim()) {
            return res.status(400).json({ error: 'Question et réponse requises' });
        }
        const faq = await Faq.create({ question: question.trim(), answer: answer.trim() });
        res.status(201).json(faq);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateFaq = async (req, res) => {
    try {
        const { question, answer } = req.body;
        const fields = {};
        if (question !== undefined) fields.question = question.trim();
        if (answer !== undefined) fields.answer = answer.trim();
        if (!Object.keys(fields).length) return res.status(400).json({ error: 'Aucun champ à mettre à jour' });
        await Faq.update(fields, { where: { id: req.params.id } });
        res.json({ message: 'FAQ mise à jour' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteFaq = async (req, res) => {
    try {
        await Faq.destroy({ where: { id: req.params.id } });
        res.json({ message: 'FAQ supprimée' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Polices
export const getAllPolicies = async (req, res) => {
    try {
        const policies = await Policy.findAll({ order: [['id', 'DESC']] });
        res.json(policies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getPolicyByType = async (req, res) => {
    try {
        const policy = await Policy.findOne({ where: { type: req.params.type } });
        if (!policy) return res.status(404).json({ error: 'Politique introuvable' });
        res.json(policy);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const ALLOWED_POLICY_TYPES = ['general', 'supplier', 'delivery', 'privacy', 'return', 'mentions_legales'];

export const createPolicy = async (req, res) => {
    try {
        const { title, content, type } = req.body;
        if (!title?.trim() || !content?.trim()) {
            return res.status(400).json({ error: 'Titre et contenu requis' });
        }
        if (type && !ALLOWED_POLICY_TYPES.includes(type)) {
            return res.status(400).json({ error: 'Type de politique invalide' });
        }
        const policy = await Policy.create({ title: title.trim(), content: content.trim(), type: type || 'general' });
        res.status(201).json(policy);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updatePolicy = async (req, res) => {
    try {
        const { title, content, type } = req.body;
        const fields = {};
        if (title !== undefined) fields.title = title.trim();
        if (content !== undefined) fields.content = content.trim();
        if (type !== undefined) {
            if (!ALLOWED_POLICY_TYPES.includes(type)) {
                return res.status(400).json({ error: 'Type de politique invalide' });
            }
            fields.type = type;
        }
        if (!Object.keys(fields).length) return res.status(400).json({ error: 'Aucun champ à mettre à jour' });
        await Policy.update(fields, { where: { id: req.params.id } });
        res.json({ message: 'Politique mise à jour' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deletePolicy = async (req, res) => {
    try {
        await Policy.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Politique supprimée' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllPlatformReviews = async (req, res) => {
    try {
        const reviews = await PlatformReview.findAll({
            where: { status: 'visible' },
            include: [{ model: Profile, as: 'author', attributes: ['fullname', 'avatar_url'] }],
            order: [['created_at', 'DESC']]
        });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createPlatformReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const review = await PlatformReview.create({
            id: uuidv4(),
            user_id: req.auth.userId,
            rating,
            comment
        });
        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getCGV = async (req, res) => {
    try {
        const cgv = await Policy.findOne({ where: { type: 'cgv' } });
        res.json(cgv);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const subscribeNewsletter = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'Email invalide' });
        }
        
        await Newsletter.findOrCreate({
            where: { email },
            defaults: { email }
        });
        
        res.status(201).json({ message: 'Inscription réussie' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};