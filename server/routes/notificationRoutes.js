import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { getMyNotifications, markAsRead, markAllAsRead, deleteNotification } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/me', requireAuth, getMyNotifications);
router.put('/mark-all-read', requireAuth, markAllAsRead);
router.put('/:id/read', requireAuth, markAsRead);
router.delete('/:id', requireAuth, deleteNotification);

export default router;

