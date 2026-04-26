import express from 'express';
import * as orderController from '../controllers/orderController.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', requireAuth, orderController.getMyOrders);
router.get('/me/supplier', requireAuth, orderController.getMySupplierOrders);
router.get('/', requireAuth, requireAdmin, orderController.getAllOrders);
router.get('/:id', requireAuth, orderController.getOrderById);
router.get('/:id/delivery-code', requireAuth, orderController.getOrderDeliveryCode);
router.post('/', orderController.createOrder);
router.put('/:id/status', requireAuth, orderController.updateOrderStatus);

router.get('/:id/suggested-livreurs', requireAuth, requireAdmin, orderController.getSuggestedLivreurs);

export default router;