import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';
import * as disputeController from '../controllers/disputeController.js';
import * as financialController from '../controllers/financialController.js';
import { fixVariantPrices } from '../controllers/productController.js';
import { getDeliveryFeeTiersConfig, updateDeliveryFeeTiersConfig, simulateDeliveryFee, getDeliveryMultiplierTiersConfig, updateDeliveryMultiplierTiersConfig } from '../controllers/deliveryFeeController.js';

const router = express.Router();

// Dispute management
router.get('/disputes', requireAuth, requireAdmin, disputeController.getAllDisputes);
router.patch('/disputes/:id', requireAuth, requireAdmin, disputeController.updateDisputeStatus);
router.get('/disputes/stats', requireAuth, requireAdmin, disputeController.getDisputeStats);
router.patch('/disputes/:id/supplier-response', requireAuth, requireAdmin, disputeController.supplierRespondToDispute);

// Maintenance / Sync - Temporairement public pour débloquer le terminal
router.get('/sync-financials', requireAuth, requireAdmin, financialController.adminSyncFinancials);
router.post('/sync-financials', requireAuth, requireAdmin, financialController.adminSyncFinancials);

// Price Migration - Fix stale variant prices (admin only)
router.post('/fix-variant-prices', requireAuth, requireAdmin, fixVariantPrices);

// ── Delivery Fee Tiers (admin management) ──
router.get('/delivery-fee-tiers', requireAuth, requireAdmin, getDeliveryFeeTiersConfig);
router.put('/delivery-fee-tiers', requireAuth, requireAdmin, updateDeliveryFeeTiersConfig);
// Public simulation endpoint (no auth needed — used by supplier portal preview)
router.post('/delivery-fee-simulate', simulateDeliveryFee);

// ── Delivery Multiplier Tiers (admin management) ──
router.get('/delivery-multiplier-tiers', requireAuth, requireAdmin, getDeliveryMultiplierTiersConfig);
router.put('/delivery-multiplier-tiers', requireAuth, requireAdmin, updateDeliveryMultiplierTiersConfig);

export default router;
