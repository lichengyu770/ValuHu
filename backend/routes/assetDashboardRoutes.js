const express = require('express');
const router = express.Router();
const assetDashboardController = require('../controllers/assetDashboardController');

// 资产看板路由
router.get('/overview', assetDashboardController.getAssetOverview);
router.get('/value-trend', assetDashboardController.getValueTrend);
router.get('/risk-alerts', assetDashboardController.getRiskAlerts);
router.get('/distribution', assetDashboardController.getAssetDistribution);

module.exports = router;