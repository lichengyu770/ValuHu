const express = require('express');
const router = express.Router();
const macroAnalysisController = require('../controllers/macroAnalysisController');
const { protect } = require('../middleware/auth');

/**
 * 宏观分析仪表板路由
 */

// 获取宏观分析数据列表
router.get('/', macroAnalysisController.getMacroAnalysisData);

// 获取单个宏观分析数据详情
router.get('/:id', macroAnalysisController.getMacroAnalysisDataById);

// 创建宏观分析数据（需要认证）
router.post('/', protect, macroAnalysisController.createMacroAnalysisData);

// 更新宏观分析数据（需要认证）
router.put('/:id', protect, macroAnalysisController.updateMacroAnalysisData);

// 删除宏观分析数据（需要认证）
router.delete('/:id', protect, macroAnalysisController.deleteMacroAnalysisData);

// 获取宏观分析指标趋势数据
router.get('/trend-data', macroAnalysisController.getMacroTrendData);

// 获取宏观分析仪表板数据
router.get('/dashboard', macroAnalysisController.getDashboardData);

// 政策影响模拟（需要认证）
router.post('/simulate-policy-impact', protect, macroAnalysisController.simulatePolicyImpact);

// 获取宏观指标对比数据
router.get('/comparison', macroAnalysisController.getIndicatorComparison);

module.exports = router;