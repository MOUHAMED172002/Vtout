const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { requireAuth } = require('../middleware/clerkMiddleware');

router.get('/product/:productId', reviewController.getProductReviews);
router.get('/me', requireAuth, reviewController.getMyReviews);
router.post('/', requireAuth, reviewController.createReview);
router.delete('/:id', requireAuth, reviewController.deleteReview);

module.exports = router;
