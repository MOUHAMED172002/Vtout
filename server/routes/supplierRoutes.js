import express from 'express';
import { requireAdmin, requireAuth, requireFournisseur } from '../middleware/authMiddleware.js';
import * as supplierController from '../controllers/supplierController.js';

const router = express.Router();

// ---- Routes Fournisseur (Self-service) ----
// Un utilisateur connecté peut s'auto-inscrire comme fournisseur
router.post('/register', requireAuth, supplierController.registerSelf);

// Un fournisseur récupère son propre profil
// Pas de requireFournisseur ici pour permettre au tout nouveau fournisseur d'accéder dès le signup
router.get('/me', requireAuth, supplierController.getMyProfile);

// Un fournisseur met à jour son profil (position, etc)
router.patch('/me', requireAuth, requireFournisseur, supplierController.updateMyProfile);

// Un fournisseur récupère ses propres produits / boutiques
router.get('/me/products', requireAuth, requireFournisseur, supplierController.getMyProducts);
router.get('/me/boutiques', requireAuth, requireFournisseur, supplierController.getMyBoutiques);
router.post('/me/boutiques', requireAuth, requireFournisseur, supplierController.createBoutique);
router.patch('/me/boutiques/:id', requireAuth, requireFournisseur, supplierController.updateMyBoutique);
router.delete('/me/boutiques/:id', requireAuth, requireFournisseur, supplierController.deleteMyBoutique);

// ---- Routes Admin uniquement ----
router.get('/', requireAdmin, supplierController.getAllSuppliers);
router.post('/', requireAdmin, supplierController.createSupplier);
router.get('/products', requireAdmin, supplierController.getAllSupplierProducts);
router.get('/boutiques-all', requireAdmin, supplierController.getAllBoutiques);
router.get('/:id', requireAdmin, supplierController.getSupplierById);
router.patch('/:id', requireAdmin, supplierController.updateSupplier);
router.delete('/:id', requireAdmin, supplierController.deleteSupplier);
router.post('/notify-incomplete', requireAdmin, supplierController.notifyIncompleteSuppliers);

// Supplier-Product relationship routes
router.patch('/products/:id', requireAdmin, supplierController.updateSupplierProduct);
router.delete('/products/:id', requireAdmin, supplierController.deleteSupplierProduct);
router.post('/boutiques-admin', requireAdmin, supplierController.adminCreateBoutique);


export default router;