import express from 'express';
import { requireAdmin } from '../middleware/authMiddleware.js';
import * as policyController from '../controllers/policyController.js';

const router = express.Router();



// Public
router.get('/', policyController.getAllPolicies);
router.get('/type/:type', policyController.getPoliciesByType);

// Admin
router.post('/', requireAdmin, policyController.createPolicy);
router.put('/:id', requireAdmin, policyController.updatePolicy);
router.delete('/:id', requireAdmin, policyController.deletePolicy);

export default router;