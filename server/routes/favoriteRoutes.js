const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/', requireAuth, favoriteController.getMyFavorites);
router.get('/check/:product_id', requireAuth, favoriteController.checkFavorite);
router.post('/', requireAuth, favoriteController.addFavorite);
router.post('/toggle', requireAuth, favoriteController.toggleFavorite);
router.delete('/:product_id', requireAuth, favoriteController.removeFavorite);

module.exports = router;
