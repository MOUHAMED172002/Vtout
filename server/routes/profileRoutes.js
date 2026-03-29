const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

router.post('/sync', requireAuth, profileController.syncProfile);
router.get('/me', requireAuth, profileController.getMe);
router.patch('/me', requireAuth, profileController.updateMe);
router.get('/', requireAuth, requireAdmin, profileController.getAllProfiles);
router.get('/:id', requireAuth, profileController.getProfile);
router.patch('/:id/status', requireAuth, requireAdmin, profileController.updateProfileStatus);

module.exports = router;
