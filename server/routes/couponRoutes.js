import express from 'express';
import * as couponController from '../controllers/couponController.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/validate', couponController.validateCoupon);
router.get('/', requireAuth, requireAdmin, couponController.getAllCoupons);
router.post('/', requireAuth, requireAdmin, couponController.createCoupon);
router.put('/:id', requireAuth, requireAdmin, couponController.updateCoupon);
router.patch('/:id/toggle', requireAuth, requireAdmin, couponController.toggleCoupon);
router.delete('/:id', requireAuth, requireAdmin, couponController.deleteCoupon);
router.get('/:id/usages', requireAuth, requireAdmin, couponController.getCouponUsages);

export default router;
