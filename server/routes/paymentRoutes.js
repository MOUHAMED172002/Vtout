import express from 'express';
import * as paymentController from '../controllers/paymentController.js';

const router = express.Router();

// Route pour le retour après paiement FedaPay (Redirection)
router.get('/fedapay-callback', paymentController.fedapayCallback);

// Webhook silencieux pour FedaPay (Confirmation automatique en asynchrone)
// `verify` conserve le corps brut (req.rawBody) — indispensable pour calculer
// la signature HMAC de x-fedapay-signature, qui doit porter sur les octets
// exacts envoyés par FedaPay, pas sur le JSON re-sérialisé après parsing.
router.post('/fedapay-webhook', express.json({
    verify: (req, res, buf) => { req.rawBody = buf; }
}), paymentController.fedapayWebhook);

export default router;
