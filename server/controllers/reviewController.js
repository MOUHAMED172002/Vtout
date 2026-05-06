import { Review, Profile, Product, ProductImage } from '../models/index.js';
import crypto from 'crypto';


export const getProductReviews = async (req, res) => {
    try {
        
        const { productId } = req.params;
        const { limit = 20 } = req.query;
        const reviews = await Review.findAll({
            where: { product_id: productId },
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            include: [{ model: Profile, as: 'author', attributes: ['fullname', 'avatar_url'] }]
        });
        res.json(reviews);
    } catch (error) {
        console.error('getProductReviews error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des avis' });
    }
};

export const getMyReviews = async (req, res) => {
    try {
        
        console.log('[getMyReviews] Start for auth:', req.auth);
        const userId = req.auth?.userId;
        if (!userId) {
            console.warn('[getMyReviews] No userId in req.auth');
            return res.status(401).json({ error: 'Non authentifié' });
        }

        console.log(`[getMyReviews] Querying reviews for userId: ${userId}`);
        const reviews = await Review.findAll({
            where: { user_id: userId },
            order: [['createdAt', 'DESC']],
            include: [{
                model: Product,
                as: 'product',
                attributes: ['id', 'name'],
                include: [{
                    model: ProductImage,
                    as: 'images',
                    attributes: ['image_url']
                }]
            }]
        });
        console.log(`[getMyReviews] Success: ${reviews.length} reviews found`);
        res.json(reviews);
    } catch (error) {
        console.error('[getMyReviews] ERROR CAUGHT:', error);
        res.status(500).json({
            error: 'Erreur lors de la récupération de vos avis'
        });

    }
};

export const createReview = async (req, res) => {
    try {
        
        const userId = req.auth?.userId;
        const { product_id, order_id, rating, title, body, images } = req.body;

        if (!product_id || !rating) {
            return res.status(400).json({ error: 'Le produit et la note sont requis.' });
        }

        // Vérifier si l'utilisateur a déjà laissé un avis pour ce produit
        const existingReview = await Review.findOne({
            where: { user_id: userId, product_id }
        });

        if (existingReview) {
            return res.status(400).json({ error: 'Vous avez déjà donné votre avis sur ce produit.' });
        }

        // Vérification Achat Vérifié
        const { Order, OrderItem } = await import('../models/index.js');
        const hasOrdered = await Order.findOne({
            where: { user_id: userId, status: ['livree', 'livrée'] },
            include: [{
                model: OrderItem,
                as: 'items',
                where: { product_id: product_id }
            }]
        });

        const review = await Review.create({
            id: crypto.randomUUID(),
            user_id: userId,
            product_id,
            order_id: order_id || (hasOrdered ? hasOrdered.id : null),
            is_verified: !!hasOrdered,
            rating,
            title: title || null,
            body: body || "",
            images: images || []
        });
        res.status(201).json(review);
    } catch (error) {
        console.error('createReview error:', error);
        res.status(500).json({ error: 'Erreur lors de la création de l\'avis' });
    }
};

export const deleteReview = async (req, res) => {
    try {
        
        const userId = req.auth?.userId;
        const { id } = req.params;
        await Review.destroy({
            where: { id, user_id: userId }
        });
        res.json({ message: 'Avis supprimé' });
    } catch (error) {
        console.error('deleteReview error:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
};