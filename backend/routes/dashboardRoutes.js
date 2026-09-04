const express = require('express');
const router = express.Router();
const { getStats, getChartData, getRecentActivity } = require('../controllers/dashboardController');
const protect = require('../middleware/authMiddleware');

router.use(protect);

router.get('/stats', getStats);
router.get('/charts', getChartData);
router.get('/activity', getRecentActivity);

module.exports = router;
