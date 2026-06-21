import express from 'express';
import { getKits, getKitById, createKit, updateKit, deleteKit } from '../controllers/kitController.js';
import { requireAuth, requireAdmin, requireFournisseur } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getKits);
router.get('/:id', getKitById);
router.post('/', requireAuth, requireFournisseur, createKit);
router.put('/:id', requireAuth, requireFournisseur, updateKit);
router.delete('/:id', requireAuth, requireAdmin, deleteKit);

export default router;
