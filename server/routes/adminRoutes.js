import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';
import * as disputeController from '../controllers/disputeController.js';
import * as financialController from '../controllers/financialController.js';

const router = express.Router();

// Dispute management
router.get('/disputes', requireAuth, requireAdmin, disputeController.getAllDisputes);
router.patch('/disputes/:id', requireAuth, requireAdmin, disputeController.updateDisputeStatus);

// Maintenance / Sync - Temporairement public pour débloquer le terminal
router.get('/sync-financials', financialController.adminSyncFinancials);

export default router;
