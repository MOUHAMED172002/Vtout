import { Cart, Product, ProductImage, Boutique } from '../models/index.js';
import { processProductsForCommunes } from './productController.js';

export const getMyCart = async (req, res) => {
    try {
        const { userId } = req.auth;
        const cartItems = await Cart.findAll({
            where: { user_id: userId },
            include: [{
                model: Product,
                as: 'product',
                include: [
                    { model: ProductImage, as: 'images' },
                    { model: Boutique, as: 'boutique' }
                ]
            }]
        });

        // Enrich products with free_delivery_communes
        const processedItems = await Promise.all(cartItems.map(async (item) => {
            const itemJson = item.toJSON();
            if (item.product) {
                const [processedProduct] = await processProductsForCommunes([item.product]);
                itemJson.product = processedProduct;
            }
            return itemJson;
        }));

        res.json(processedItems);
    } catch (error) {
        console.error('GetMyCart error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du panier' });
    }
};

export const addToCart = async (req, res) => {
    try {
        const { userId } = req.auth;
        const { product_id, variant_id = null, quantity = 1, price_snapshot, image_url, selected_attributes = {}, kit_id = null } = req.body;

        const [item, created] = await Cart.findOrCreate({
            where: { user_id: userId, product_id, variant_id },
            defaults: {
                quantity,
                price_snapshot,
                image_url,
                selected_attributes,
                kit_id
            }
        });

        if (!created) {
            item.quantity += quantity;
            if (image_url) item.image_url = image_url;
            if (selected_attributes) item.selected_attributes = selected_attributes;
            // Don't overwrite kit context when item already belongs to a different kit
            const kitConflict = kit_id && item.kit_id && item.kit_id !== kit_id;
            if (!kitConflict) {
                if (price_snapshot != null) item.price_snapshot = price_snapshot;
                if (kit_id !== undefined) item.kit_id = kit_id;
            }
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

        // If this item belongs to a kit, invalidate all sibling kit items
        // so their prices revert to normal (kit discount requires all components)
        const item = await Cart.findOne({ where: { id, user_id: userId } });
        if (item?.kit_id) {
            await Cart.update(
                { kit_id: null, price_snapshot: null },
                { where: { user_id: userId, kit_id: item.kit_id } }
            );
        }

        await Cart.destroy({ where: { id, user_id: userId } });

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