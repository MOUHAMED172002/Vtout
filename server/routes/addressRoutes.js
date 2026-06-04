import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import * as addressController from '../controllers/addressController.js';

const router = express.Router();

router.get('/user/:userId', requireAuth, addressController.getUserAddresses);
router.get('/me', requireAuth, addressController.getMyAddresses);
router.post('/', addressController.createAddress); // guests allowed — controller handles null userId
router.patch('/:id', requireAuth, addressController.updateAddress);
router.delete('/:id', requireAuth, addressController.deleteAddress);

export default router;