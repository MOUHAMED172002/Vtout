import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';
import * as supportController from '../controllers/supportController.js';

const router = express.Router();

router.post('/send', requireAuth, supportController.sendMessage);
router.get('/messages', requireAuth, supportController.getMessages);
router.get('/admin/conversations', requireAuth, requireAdmin, supportController.getAllConversations);

export default router;