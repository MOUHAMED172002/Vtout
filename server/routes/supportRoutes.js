const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

router.post('/send', requireAuth, supportController.sendMessage);
router.get('/messages', requireAuth, supportController.getMessages);
router.get('/admin/conversations', requireAuth, requireAdmin, supportController.getAllConversations);

module.exports = router;
