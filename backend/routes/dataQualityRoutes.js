const express = require('express');
const router = express.Router();
const {
  getLowConfidenceValuations,
  markAsAnomaly,
  manualCorrectValuation,
  getModelAccuracy,
  getDataQualityReport
} = require('../controllers/dataQualityController');
const { protect } = require('../middleware/auth');

// 获取低置信度估价列表（需要认证）
router.get('/low-confidence', protect, getLowConfidenceValuations);

// 标记数据为异常（需要认证）
router.post('/anomaly/:id', protect, markAsAnomaly);

// 手动修正估价结果（需要认证）
router.put('/correct/:id', protect, manualCorrectValuation);

// 获取模型精度分析（需要认证）
router.get('/model-accuracy', protect, getModelAccuracy);

// 获取数据质量报告（需要认证）
router.get('/report', protect, getDataQualityReport);

module.exports = router;