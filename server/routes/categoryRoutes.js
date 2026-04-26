import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';
import * as categoryController from '../controllers/categoryController.js';

const router = express.Router();




router.get('/', categoryController.getAllCategories);
router.post('/', requireAuth, requireAdmin, categoryController.createCategory);
router.delete('/:id', requireAuth, requireAdmin, categoryController.deleteCategory);

export default router;