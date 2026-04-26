import express from 'express';
import * as paymentController from '../controllers/paymentController.js';

const router = express.Router();

// Route pour le retour après paiement FedaPay (Redirection)
router.get('/fedapay-callback', paymentController.fedapayCallback);

// Webhook silencieux pour FedaPay (Confirmation automatique en asynchrone)
router.post('/fedapay-webhook', express.json(), paymentController.fedapayWebhook);

export default router;
