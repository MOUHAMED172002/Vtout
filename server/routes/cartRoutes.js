const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { requireAuth } = require('../middleware/clerkMiddleware');

router.get('/', requireAuth, cartController.getMyCart);
router.post('/', requireAuth, cartController.addToCart);
router.patch('/:id', requireAuth, cartController.updateCartItemQuantity);
router.delete('/:id', requireAuth, cartController.removeFromCart);

module.exports = router;
