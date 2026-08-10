import express from 'express';
import * as orderController from '../controllers/orderController.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', requireAuth, orderController.getMyOrders);
router.get('/me/supplier', requireAuth, orderController.getMySupplierOrders);
router.get('/', requireAuth, requireAdmin, orderController.getAllOrders);
// Pas de requireAuth ici : le contrôleur gère déjà explicitement l'accès
// invité par UUID ("2. Guest Order access" dans getOrderById) — mais ce
// code était mort tant que ce middleware bloquait tout accès non
// authentifié en amont avec un 401, empêchant GuestOrderConfirmationPage.jsx
// de fonctionner pour un vrai invité (sans compte). authMiddleware (global,
// appliqué avant toutes les routes) décore req.auth quand un token est
// présent, sans jamais bloquer son absence — la vérification de propriété
// reste donc entièrement assurée par le contrôleur lui-même.
router.get('/:id', orderController.getOrderById);
router.get('/:id/delivery-code', requireAuth, orderController.getOrderDeliveryCode);
router.post('/', orderController.createOrder); // guests allowed — controller handles null userId
router.post('/:id/retry-payment', orderController.retryOrderPayment); // guests allowed — self-service retry for failed online payments
// Confirmation explicite depuis le widget FedaPay embarqué (onComplete) —
// guests inclus, re-vérifiée serveur-à-serveur dans le contrôleur, jamais
// fait confiance au seul signal du navigateur.
router.post('/pending-checkout/:id/confirm', orderController.confirmPendingCheckout);
router.put('/:id/status', requireAuth, orderController.updateOrderStatus);
router.post('/:id/dispute', requireAuth, orderController.reportOrderDispute);
router.patch('/:id/dispute/response', requireAuth, orderController.respondToDisputeResolution);
router.post('/:id/dispute/evidence', requireAuth, orderController.addDisputeEvidence);

router.get('/:id/suggested-livreurs', requireAuth, requireAdmin, orderController.getSuggestedLivreurs);
router.get('/:id/suggested-suppliers', requireAuth, requireAdmin, orderController.getSuggestedSuppliers);
router.put('/:id/assign-supplier', requireAuth, requireAdmin, orderController.assignSupplier);
router.post('/check-reminders', requireAuth, requireAdmin, orderController.triggerStuckOrdersCheck);
 
export default router;