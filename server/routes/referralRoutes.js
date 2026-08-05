import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';
import * as referralController from '../controllers/referralController.js';

const router = express.Router();

router.get('/me', requireAuth, referralController.getMyReferralInfo);
router.post('/apply', requireAuth, referralController.applyReferralCode);

router.get('/admin/settings', requireAuth, requireAdmin, referralController.getReferralSettingsAdmin);
router.patch('/admin/settings', requireAuth, requireAdmin, referralController.updateReferralSettings);
router.get('/admin/all', requireAuth, requireAdmin, referralController.getAllReferralsAdmin);
router.get('/admin/stats', requireAuth, requireAdmin, referralController.getReferralStatsAdmin);

export default router;
