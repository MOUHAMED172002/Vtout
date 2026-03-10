const crypto = require('crypto');

exports.getProductReviews = async (req, res) => {
    try {
        const { Review, Profile } = require('../models');
        const { productId } = req.params;
        const { limit = 20 } = req.query;
        const reviews = await Review.findAll({
            where: { product_id: productId },
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            include: [{ model: Profile, as: 'user', attributes: ['fullname', 'avatar_url'] }]
        });
        res.json(reviews);
    } catch (error) {
        console.error('getProductReviews error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des avis' });
    }
};

exports.getMyReviews = async (req, res) => {
    try {
        const { Review, Product, ProductImage } = require('../models');
        console.log('[getMyReviews] Start for auth:', req.auth);
        const userId = req.auth?.userId;
        if (!userId) {
            console.warn('[getMyReviews] No userId in req.auth');
            return res.status(401).json({ error: 'Non authentifié' });
        }

        const reviews = await Review.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']],
            include: [{
                model: Product,
                as: 'product',
                attributes: ['id', 'name'],
                include: [{
                    model: ProductImage,
                    as: 'images',
                    attributes: ['image_url'],
                    limit: 1
                }]
            }]
        });
        console.log(`[getMyReviews] Success: ${reviews.length} reviews found`);
        res.json(reviews);
    } catch (error) {
        console.error('getMyReviews error detailed:', error);
        res.status(500).json({
            error: 'Erreur lors de la récupération de vos avis',
            details: error.message,
            stack: error.stack
        });
    }
};

exports.createReview = async (req, res) => {
    try {
        const { Review } = require('../models');
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

        const review = await Review.create({
            id: crypto.randomUUID(),
            user_id: userId,
            product_id,
            order_id: order_id || null,
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

exports.deleteReview = async (req, res) => {
    try {
        const { Review } = require('../models');
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
