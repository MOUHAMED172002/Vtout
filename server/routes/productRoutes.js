import express from 'express';
import { getAllProducts, getProductById, searchProducts, getRelatedProducts, getFrequentlyBoughtTogether, createProduct, updateProduct, deleteProduct, adminCreateProduct } from '../controllers/productController.js';

import { requireAdmin, requireFournisseur, requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/search', searchProducts);
router.get('/:id', getProductById);
router.get('/:id/related', getRelatedProducts);
router.get('/:id/bought-together', getFrequentlyBoughtTogether);
router.post('/', requireFournisseur, createProduct);
router.put('/:id', requireFournisseur, updateProduct);
router.delete('/:id', requireFournisseur, deleteProduct);
router.post('/admin', requireAdmin, adminCreateProduct);

export default router;