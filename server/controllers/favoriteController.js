import { Favorite, Product, ProductImage } from '../models/index.js';
import crypto from 'crypto';


export const addFavorite = async (req, res) => {
    try {
        const { userId } = req.auth;
        const { product_id } = req.body;

        const [favorite, created] = await Favorite.findOrCreate({
            where: { user_id: userId, product_id },
            defaults: { id: crypto.randomUUID() }
        });

        res.status(201).json({ favorite, created });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de l’ajout aux favoris' });
    }
};

export const removeFavorite = async (req, res) => {
    try {
        const { userId } = req.auth;
        const { product_id } = req.params;

        await Favorite.destroy({
            where: { user_id: userId, product_id }
        });

        res.json({ message: 'Retiré des favoris' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la suppression du favori' });
    }
};

export const getMyFavorites = async (req, res) => {
    try {
        const { userId } = req.auth;
        const favorites = await Favorite.findAll({
            where: { user_id: userId },
            include: [{
                model: Product,
                as: 'product',
                include: [{
                    model: ProductImage,
                    as: 'images'
                }]
            }]
        });
        res.json(favorites);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des favoris' });
    }
};

export const checkFavorite = async (req, res) => {
    try {
        const { userId } = req.auth;
        const { product_id } = req.params;
        const favorite = await Favorite.findOne({
            where: { user_id: userId, product_id }
        });
        res.json({ isFavorite: !!favorite });
    } catch (error) {
        res.status(500).json({ error: 'Erreur' });
    }
};

export const toggleFavorite = async (req, res) => {
    try {
        const { userId } = req.auth;
        const { product_id } = req.body;

        const favorite = await Favorite.findOne({
            where: { user_id: userId, product_id }
        });

        if (favorite) {
            await favorite.destroy();
            res.json({ message: 'Retiré des favoris', isFavorite: false });
        } else {
            await Favorite.create({
                id: crypto.randomUUID(),
                user_id: userId,
                product_id
            });
            res.status(201).json({ message: 'Ajouté aux favoris', isFavorite: true });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors du basculement des favoris' });
    }
};