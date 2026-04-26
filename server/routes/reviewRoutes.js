import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import * as reviewController from '../controllers/reviewController.js';

const router = express.Router();



router.get('/product/:productId', reviewController.getProductReviews);
router.get('/me', requireAuth, reviewController.getMyReviews);
router.post('/', requireAuth, reviewController.createReview);
router.delete('/:id', requireAuth, reviewController.deleteReview);

export default router;