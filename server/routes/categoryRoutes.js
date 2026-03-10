const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

const { requireAuth, requireAdmin } = require('../middleware/clerkMiddleware');

router.get('/', categoryController.getAllCategories);
router.post('/', requireAuth, requireAdmin, categoryController.createCategory);
router.delete('/:id', requireAuth, requireAdmin, categoryController.deleteCategory);

module.exports = router;
