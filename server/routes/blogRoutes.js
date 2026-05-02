import express from 'express';
import { requireAdmin } from '../middleware/authMiddleware.js';
import * as blogController from '../controllers/blogController.js';

const router = express.Router();

// Public
router.get('/', blogController.getAllBlogs);
router.get('/:slug', blogController.getBlogBySlug);

// Admin
router.post('/', requireAdmin, blogController.createBlog);
router.put('/:id', requireAdmin, blogController.updateBlog);
router.delete('/:id', requireAdmin, blogController.deleteBlog);

export default router;
