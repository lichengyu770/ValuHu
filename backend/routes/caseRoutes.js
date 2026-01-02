const express = require('express');
const router = express.Router();
const { getCases, getCaseById, createCase, updateCase, deleteCase, rateCase, getCaseStats, getRecommendedCases } = require('../controllers/caseController');
const { protect } = require('../middleware/auth');

// 获取案例列表（公开路由，支持搜索、筛选和分页）
router.get('/', getCases);

// 获取单个案例详情（公开路由）
router.get('/:id', getCaseById);

// 创建新案例（需要认证）
router.post('/', protect, createCase);

// 更新案例（需要认证）
router.put('/:id', protect, updateCase);

// 删除案例（需要认证）
router.delete('/:id', protect, deleteCase);

// 为案例评分（需要认证）
router.post('/:id/rate', protect, rateCase);

// 获取案例统计信息（公开路由）
router.get('/stats', getCaseStats);

// 获取推荐案例（公开路由）
router.get('/recommended', getRecommendedCases);

module.exports = router;