const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { requireAdmin } = require('../middleware/authMiddleware');

router.get('/dashboard', requireAdmin, statsController.getDashboardStats);
router.get('/search-analytics', requireAdmin, statsController.getFailedSearches);

module.exports = router;

