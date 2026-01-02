const express = require('express');
const router = express.Router();
const monitoringController = require('../controllers/monitoringController');

// 监控路由
router.get('/user-growth', monitoringController.getUserGrowth);
router.get('/api-usage', monitoringController.getApiUsage);
router.get('/activity', monitoringController.getActivity);
router.get('/overview', monitoringController.getSystemOverview);

module.exports = router;