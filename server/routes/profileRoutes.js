import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';
import * as profileController from '../controllers/profileController.js';

const router = express.Router();



router.post('/sync', requireAuth, profileController.syncProfile);
router.get('/me', requireAuth, profileController.getMe);
router.patch('/me', requireAuth, profileController.updateMe);
router.delete('/me', requireAuth, profileController.deleteMe);
router.get('/', requireAuth, requireAdmin, profileController.getAllProfiles);
router.get('/:id', requireAuth, profileController.getProfile);
router.patch('/:id/status', requireAuth, requireAdmin, profileController.updateProfileStatus);

router.post('/switch-role', requireAuth, profileController.switchRole);

router.post('/push-token', requireAuth, profileController.registerPushToken);
router.delete('/push-token', requireAuth, profileController.removePushToken);

export default router;