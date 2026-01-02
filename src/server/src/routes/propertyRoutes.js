const express = require('express');
const router = express.Router();
const PropertyController = require('../controllers/PropertyController');

// 创建物业信息
router.post('/', PropertyController.createProperty);

// 获取物业列表
router.get('/', PropertyController.getPropertyList);

// 获取物业统计信息
router.get('/stats', PropertyController.getPropertyStats);

// 获取物业详情
router.get('/:id', PropertyController.getPropertyById);

// 更新物业信息
router.put('/:id', PropertyController.updateProperty);

// 删除物业信息
router.delete('/:id', PropertyController.deleteProperty);

module.exports = router;
