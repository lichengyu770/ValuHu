// 房源接口路由
import express from 'express';
const router = express.Router();
import HouseController from '../controllers/HouseController.js';

// 获取所有房源
router.get('/properties', HouseController.getAllProperties);

// 获取单个房源
router.get('/properties/:id', HouseController.getPropertyById);

// 添加房源
router.post('/properties', HouseController.addProperty);

// 更新房源
router.put('/properties/:id', HouseController.updateProperty);

// 删除房源
router.delete('/properties/:id', HouseController.deleteProperty);

// 高级房源搜索
router.post('/properties/search', HouseController.advancedSearch);

// 获取房源估价记录
router.get('/properties/:id/valuation', HouseController.getPropertyValuations);

// 获取小区列表
router.get('/districts', HouseController.getDistricts);

// 获取市场分析数据
router.get('/market-analysis', HouseController.getMarketAnalysis);

export default router;