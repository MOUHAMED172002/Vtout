import express from 'express';
import * as paymentController from '../controllers/paymentController.js';

const router = express.Router();

// Route pour le retour après paiement FedaPay (Redirection)
router.get('/fedapay-callback', paymentController.fedapayCallback);

// Webhook silencieux pour FedaPay (Confirmation automatique en asynchrone)
// req.body et req.rawBody sont déjà fournis par le express.json({verify})
// GLOBAL posé dans index.js — poser un second express.json() ici serait
// non seulement redondant mais actif nuisible : le flux de la requête est
// déjà consommé par le middleware global à ce stade, donc ce second
// parseur ne recevrait plus rien et req.rawBody resterait vide (c'était
// exactement le bug qui empêchait la vérification de signature).
router.post('/fedapay-webhook', paymentController.fedapayWebhook);

export default router;
