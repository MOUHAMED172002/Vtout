const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { requireAdmin } = require('../middleware/clerkMiddleware');

// Public routes
router.get('/faqs', contentController.getAllFaqs);
router.get('/policies', contentController.getAllPolicies);

// Admin routes
router.post('/faqs', requireAdmin, contentController.createFaq);
router.put('/faqs/:id', requireAdmin, contentController.updateFaq);
router.delete('/faqs/:id', requireAdmin, contentController.deleteFaq);

router.post('/policies', requireAdmin, contentController.createPolicy);
router.put('/policies/:id', requireAdmin, contentController.updatePolicy);
router.delete('/policies/:id', requireAdmin, contentController.deletePolicy);

module.exports = router;
