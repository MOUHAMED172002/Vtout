const { Category, Product } = require('../models');
const fs = require('fs');
const path = require('path');

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            include: [
                { model: Category, as: 'children', attributes: ['id'] },
                { model: Product, as: 'products', attributes: ['id'] }
            ]
        });
        res.json(categories);
    } catch (error) {
        console.error('Category Search Error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des catégories' });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name, parent_id } = req.body;
        const category = await Category.create({ name, parent_id });
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la création' });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await Category.destroy({ where: { id } });
        res.json({ message: 'Catégorie supprimée' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
};
