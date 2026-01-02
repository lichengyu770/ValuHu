// 估价接口路由
import express from 'express';
const router = express.Router();
import EstimateController from '../controllers/EstimateController.js';

// 执行房产估价
router.post('/valuation', EstimateController.performValuation);

// 获取估价结果详情
router.get('/valuation/:id', EstimateController.getValuationResult);

// 获取估价历史记录
router.get('/valuation/history', EstimateController.getValuationHistory);

// 获取支持的估价方法
router.get('/valuation/methods', EstimateController.getValuationMethods);

export default router;