const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

router.get('/me', requireAuth, orderController.getMyOrders);
router.get('/me/supplier', requireAuth, orderController.getMySupplierOrders);
router.get('/', requireAuth, requireAdmin, orderController.getAllOrders);
router.get('/:id', requireAuth, orderController.getOrderById);
router.get('/:id/delivery-code', requireAuth, orderController.getOrderDeliveryCode);
router.post('/', orderController.createOrder);
router.put('/:id/status', orderController.updateOrderStatus);

module.exports = router;
