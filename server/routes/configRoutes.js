const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const { requireAdmin } = require('../middleware/clerkMiddleware');

// Public/Auth
router.get('/', configController.getAllConfigs);
router.get('/key/:key', configController.getConfigByKey);
router.get('/group/:group', configController.getConfigsByGroup);

// Admin
router.post('/upsert', requireAdmin, configController.upsertConfig);
router.delete('/:key', requireAdmin, configController.deleteConfig);

module.exports = router;
