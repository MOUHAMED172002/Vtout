import express from 'express';
import { requireAdmin, requireFournisseur, authMiddleware } from '../middleware/authMiddleware.js';
import * as statsController from '../controllers/statsController.js';

const router = express.Router();



router.get('/dashboard', authMiddleware, requireAdmin, statsController.getDashboardStats);
router.get('/search-analytics', authMiddleware, requireAdmin, statsController.getFailedSearches);
router.get('/supplier-performance', authMiddleware, requireFournisseur, statsController.getSupplierStats);
router.get('/livreur-performance', authMiddleware, statsController.getLivreurStats);

export default router;