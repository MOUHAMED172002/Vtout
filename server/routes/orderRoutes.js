const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { requireAuth, requireAdmin } = require('../middleware/clerkMiddleware');

router.get('/me', requireAuth, orderController.getMyOrders);
router.get('/me/supplier', requireAuth, orderController.getMySupplierOrders);
router.get('/', requireAuth, requireAdmin, orderController.getAllOrders);
router.get('/:id', requireAuth, orderController.getOrderById);
router.post('/', orderController.createOrder);
router.get('/:id/suggested-suppliers', requireAdmin, orderController.getSuggestedSuppliers);
router.put('/:id/assign-supplier', requireAdmin, orderController.assignSupplier);
router.put('/:id/status', orderController.updateOrderStatus);

module.exports = router;
