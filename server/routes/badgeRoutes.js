import express from 'express';
import { requireAdmin, requireAuth, requireFournisseur } from '../middleware/authMiddleware.js';
import * as badgeController from '../controllers/badgeController.js';

const router = express.Router();

// Prix mensuel (lecture accessible à tout utilisateur connecté, ex: page vendeur)
router.get('/price', requireAuth, badgeController.getPrice);

// ---- Fournisseur ----
router.get('/me', requireAuth, requireFournisseur, badgeController.getMyStatus);
router.post('/subscribe', requireAuth, requireFournisseur, badgeController.subscribe);

// ---- Admin ----
router.patch('/price', requireAdmin, badgeController.updatePrice);
router.get('/admin/subscriptions', requireAdmin, badgeController.getAllSubscriptions);
router.get('/admin/certified', requireAdmin, badgeController.getCertifiedSuppliers);
router.patch('/admin/:supplierId/revoke', requireAdmin, badgeController.revokeBadge);

export default router;
