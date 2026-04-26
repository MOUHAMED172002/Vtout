import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import * as cartController from '../controllers/cartController.js';

const router = express.Router();



router.get('/', requireAuth, cartController.getMyCart);
router.post('/', requireAuth, cartController.addToCart);
router.patch('/:id', requireAuth, cartController.updateCartItemQuantity);
router.delete('/:id', requireAuth, cartController.removeFromCart);

export default router;