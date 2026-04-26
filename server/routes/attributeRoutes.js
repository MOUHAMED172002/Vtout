import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';
import * as attributeController from '../controllers/attributeController.js';

const router = express.Router();



router.get('/', attributeController.getAllAttributes);
router.post('/', requireAuth, requireAdmin, attributeController.createAttribute);
router.patch('/:id', requireAuth, requireAdmin, attributeController.updateAttribute);
router.delete('/:id', requireAuth, requireAdmin, attributeController.deleteAttribute);

router.get('/category/:category_id', attributeController.getAttributesByCategory);
router.get('/:attribute_id/values', attributeController.getAttributeValues);
router.post('/values', requireAuth, requireAdmin, attributeController.addAttributeValue);
router.patch('/values/:id', requireAuth, requireAdmin, attributeController.updateAttributeValue);
router.delete('/values/:id', requireAuth, requireAdmin, attributeController.deleteAttributeValue);

export default router;