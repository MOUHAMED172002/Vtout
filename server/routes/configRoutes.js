import express from 'express';
import { requireAdmin } from '../middleware/authMiddleware.js';
import * as configController from '../controllers/configController.js';

const router = express.Router();

// Public configs for frontend
router.get('/public', configController.getPublicConfigs);

// Admin only
router.get('/', requireAdmin, configController.getAllConfigs);
router.get('/key/:key', requireAdmin, configController.getConfigByKey);
router.get('/group/:group', requireAdmin, configController.getConfigsByGroup);


// Admin
router.post('/upsert', requireAdmin, configController.upsertConfig);
router.post('/test-email', requireAdmin, configController.testEmailConfig);
router.post('/test-whatsapp', requireAdmin, configController.testWhatsAppConfig);
router.delete('/:key', requireAdmin, configController.deleteConfig);

export default router;