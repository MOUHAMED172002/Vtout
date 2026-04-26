import { Cart, Product, ProductImage } from '../models/index.js';


export const getMyCart = async (req, res) => {
    try {
        const { userId } = req.auth;
        const cartItems = await Cart.findAll({
            where: { user_id: userId },
            include: [{
                model: Product,
                as: 'product',
                include: [{ model: ProductImage, as: 'images' }]
            }]
        });
        res.json(cartItems);
    } catch (error) {
        console.error('GetMyCart error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du panier' });
    }
};

export const addToCart = async (req, res) => {
    try {
        const { userId } = req.auth;
        const { product_id, variant_id = null, quantity = 1, price_snapshot, image_url, selected_attributes = {} } = req.body;

        const [item, created] = await Cart.findOrCreate({
            where: { user_id: userId, product_id, variant_id },
            defaults: {
                quantity,
                price_snapshot,
                image_url,
                selected_attributes
            }
        });

        if (!created) {
            item.quantity += quantity;
            if (price_snapshot) item.price_snapshot = price_snapshot;
            if (image_url) item.image_url = image_url;
            if (selected_attributes) item.selected_attributes = selected_attributes;
            await item.save();
        }

        res.status(201).json(item);
    } catch (error) {
        console.error('AddToCart error:', error);
        res.status(500).json({ error: 'Erreur lors de l\'ajout au panier' });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const { userId } = req.auth;
        const { id } = req.params;

        await Cart.destroy({
            where: { id, user_id: userId }
        });

        res.json({ message: 'Article retiré du panier' });
    } catch (error) {
        console.error('RemoveFromCart error:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression du panier' });
    }
};

export const updateCartItemQuantity = async (req, res) => {
    try {
        const { userId } = req.auth;
        const { id } = req.params;
        const { quantity } = req.body;

        await Cart.update({ quantity }, {
            where: { id, user_id: userId }
        });

        res.json({ message: 'Quantité mise à jour' });
    } catch (error) {
        console.error('UpdateCartQuantity error:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
};