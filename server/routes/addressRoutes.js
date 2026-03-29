const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/user/:userId', requireAuth, addressController.getUserAddresses);
router.get('/me', requireAuth, addressController.getMyAddresses);
router.post('/', addressController.createAddress);
router.patch('/:id', requireAuth, addressController.updateAddress);
router.delete('/:id', requireAuth, addressController.deleteAddress);

module.exports = router;
