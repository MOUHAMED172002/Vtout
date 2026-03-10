const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { requireAdmin, requireAuth, requireFournisseur } = require('../middleware/clerkMiddleware');

// ---- Routes Fournisseur (Self-service) ----
// Un utilisateur connecté peut s'auto-inscrire comme fournisseur
router.post('/register', requireAuth, supplierController.registerSelf);
// Un fournisseur récupère son propre profil
router.get('/me', requireAuth, supplierController.getMyProfile);
// Un fournisseur récupère ses propres produits
router.get('/me/products', requireAuth, requireFournisseur, supplierController.getMyProducts);

// ---- Routes Admin uniquement ----
router.get('/', requireAdmin, supplierController.getAllSuppliers);
router.post('/', requireAdmin, supplierController.createSupplier);
router.get('/products', requireAdmin, supplierController.getAllSupplierProducts);
router.get('/:id', requireAdmin, supplierController.getSupplierById);
router.patch('/:id', requireAdmin, supplierController.updateSupplier);
router.delete('/:id', requireAdmin, supplierController.deleteSupplier);

// Supplier-Product relationship routes
router.patch('/products/:id', requireAdmin, supplierController.updateSupplierProduct);
router.delete('/products/:id', requireAdmin, supplierController.deleteSupplierProduct);

module.exports = router;
