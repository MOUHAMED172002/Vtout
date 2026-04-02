const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { requireAuth, requireLivreur } = require('../middleware/authMiddleware');

// Health check for delivery routes
router.get('/ping', (req, res) => res.json({ status: 'ok', message: 'Delivery routes are active' }));

// Public/Auth routes for delivery personnel
router.post('/register', requireAuth, deliveryController.registerLivreur);

// Protected routes (Livreur only)
router.get('/available', requireAuth, requireLivreur, deliveryController.getAvailableOrders);
router.get('/my-deliveries', requireAuth, requireLivreur, deliveryController.getMyDeliveries);
router.get('/me', requireAuth, requireLivreur, deliveryController.getMyProfile);
router.post('/assign', requireAuth, requireLivreur, deliveryController.assignToMe);
router.post('/release', requireAuth, requireLivreur, deliveryController.releaseOrder);
router.post('/status', requireAuth, requireLivreur, deliveryController.updateDeliveryStatus);
router.post('/toggle-status', requireAuth, requireLivreur, deliveryController.toggleStatus);
router.put('/location', requireAuth, requireLivreur, deliveryController.updateLocation);
router.post('/update-zones', requireAuth, requireLivreur, deliveryController.updateServiceZones);

// Admin routes
const { requireAdmin } = require('../middleware/authMiddleware');
router.get('/admin/list', requireAuth, requireAdmin, deliveryController.getLivreursList);
router.post('/admin/verify/:id', requireAuth, requireAdmin, deliveryController.verifyLivreur);
router.post('/admin/assign', requireAuth, requireAdmin, deliveryController.adminAssignOrder);
router.post('/admin/confirm-cash', requireAuth, requireAdmin, deliveryController.confirmCashRemitted);
router.get('/admin/stats', requireAuth, requireAdmin, deliveryController.getDeliveryStatsAdmin);

module.exports = router;
