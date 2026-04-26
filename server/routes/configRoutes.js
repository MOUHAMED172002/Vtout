import express from 'express';
import { requireAdmin } from '../middleware/authMiddleware.js';
import * as configController from '../controllers/configController.js';

const router = express.Router();

// Public/Auth
router.get('/', configController.getAllConfigs);
router.get('/key/:key', configController.getConfigByKey);
router.get('/group/:group', configController.getConfigsByGroup);

// Admin
router.post('/upsert', requireAdmin, configController.upsertConfig);
router.post('/test-email', requireAdmin, configController.testEmailConfig);
router.delete('/:key', requireAdmin, configController.deleteConfig);

export default router;