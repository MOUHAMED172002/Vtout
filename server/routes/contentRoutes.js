import express from 'express';
import { requireAdmin, requireAuth } from '../middleware/authMiddleware.js';
import * as contentController from '../controllers/contentController.js';

const router = express.Router();



// Public routes


// Public routes
router.get('/faqs', contentController.getAllFaqs);
router.get('/policies', contentController.getAllPolicies);
router.get('/cgv', contentController.getCGV);
router.get('/platform-reviews', contentController.getAllPlatformReviews);
router.post('/newsletter', contentController.subscribeNewsletter);

// Admin routes
router.post('/faqs', requireAdmin, contentController.createFaq);
router.patch('/faqs/:id', requireAdmin, contentController.updateFaq);
router.delete('/faqs/:id', requireAdmin, contentController.deleteFaq);

router.post('/policies', requireAdmin, contentController.createPolicy);
router.patch('/policies/:id', requireAdmin, contentController.updatePolicy);
router.delete('/policies/:id', requireAdmin, contentController.deletePolicy);

// Protected public routes

router.post('/platform-reviews', requireAuth, contentController.createPlatformReview);

export default router;