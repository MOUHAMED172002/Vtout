const express = require('express');
const router = express.Router();
const policyController = require('../controllers/policyController');
const { requireAdmin } = require('../middleware/clerkMiddleware');

// Public
router.get('/', policyController.getAllPolicies);
router.get('/type/:type', policyController.getPoliciesByType);

// Admin
router.post('/', requireAdmin, policyController.createPolicy);
router.put('/:id', requireAdmin, policyController.updatePolicy);
router.delete('/:id', requireAdmin, policyController.deletePolicy);

module.exports = router;
