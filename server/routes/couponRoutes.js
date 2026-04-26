import express from 'express';
import * as couponController from '../controllers/couponController.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/validate', couponController.validateCoupon);
router.get('/', requireAuth, requireAdmin, couponController.getAllCoupons);
router.post('/', requireAuth, requireAdmin, couponController.createCoupon);

export default router;
