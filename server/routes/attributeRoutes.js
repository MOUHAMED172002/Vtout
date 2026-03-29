const express = require('express');
const router = express.Router();
const attributeController = require('../controllers/attributeController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', attributeController.getAllAttributes);
router.post('/', requireAuth, requireAdmin, attributeController.createAttribute);
router.patch('/:id', requireAuth, requireAdmin, attributeController.updateAttribute);
router.delete('/:id', requireAuth, requireAdmin, attributeController.deleteAttribute);

router.get('/category/:category_id', attributeController.getAttributesByCategory);
router.get('/:attribute_id/values', attributeController.getAttributeValues);
router.post('/values', requireAuth, requireAdmin, attributeController.addAttributeValue);
router.patch('/values/:id', requireAuth, requireAdmin, attributeController.updateAttributeValue);
router.delete('/values/:id', requireAuth, requireAdmin, attributeController.deleteAttributeValue);

module.exports = router;

