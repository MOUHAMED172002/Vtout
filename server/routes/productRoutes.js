const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { requireAdmin, requireFournisseur, requireAuth } = require('../middleware/clerkMiddleware');

router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProductById);
router.get('/:id/related', productController.getRelatedProducts);
router.post('/', requireFournisseur, productController.createProduct);
router.put('/:id', requireFournisseur, productController.updateProduct);
router.delete('/:id', requireFournisseur, productController.deleteProduct);

module.exports = router;
