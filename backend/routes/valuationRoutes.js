const express = require('express');
const router = express.Router();
const { 
    getValuations, 
    getValuationById, 
    createValuation, 
    batchValuation,
    getMarketTrend,
    deleteValuation,
    getValuationComparison,
    getValuationHistory,
    getPropertyValuationHistory
} = require('../controllers/valuationController');
const { protect } = require('../middleware/auth');

// 获取估价列表（公开路由）
router.get('/', getValuations);

// 获取单个估价详情（公开路由）
router.get('/:id', getValuationById);

// 创建新估价（需要认证）
router.post('/', protect, createValuation);

// 批量估价（需要认证）
router.post('/batch', protect, batchValuation);

// 获取市场趋势分析（公开路由）
router.get('/market/trend', getMarketTrend);

// 获取估价对比（公开路由）
router.get('/comparison', getValuationComparison);

// 获取用户估价历史（需要认证）
router.get('/history', protect, getValuationHistory);

// 获取房产估价历史（公开路由）
router.get('/property/:property_id', getPropertyValuationHistory);

// 删除估价记录（需要认证）
router.delete('/:id', protect, deleteValuation);

module.exports = router;
