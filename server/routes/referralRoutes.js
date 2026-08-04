import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import * as referralController from '../controllers/referralController.js';

const router = express.Router();

router.get('/me', requireAuth, referralController.getMyReferralInfo);
router.post('/apply', requireAuth, referralController.applyReferralCode);

export default router;
