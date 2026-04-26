import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import * as favoriteController from '../controllers/favoriteController.js';

const router = express.Router();



router.get('/', requireAuth, favoriteController.getMyFavorites);
router.get('/check/:product_id', requireAuth, favoriteController.checkFavorite);
router.post('/', requireAuth, favoriteController.addFavorite);
router.post('/toggle', requireAuth, favoriteController.toggleFavorite);
router.delete('/:product_id', requireAuth, favoriteController.removeFavorite);

export default router;