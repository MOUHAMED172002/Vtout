import express from 'express';
import { requireAuth, requireAdmin, requireFournisseur } from '../middleware/authMiddleware.js';
import * as financialController from '../controllers/financialController.js';

const router = express.Router();

// Routes accessibles aux fournisseurs et livreurs pour voir leur solde
router.get('/my-status', requireAuth, financialController.getMyFinancials);
router.post('/request-payout', requireAuth, financialController.requestPayout);

// Admin uniquement
router.get('/admin/payouts', requireAuth, requireAdmin, financialController.adminGetAllPayoutRequests);
router.put('/admin/payouts/:id', requireAuth, requireAdmin, financialController.adminProcessPayout);

export default router;