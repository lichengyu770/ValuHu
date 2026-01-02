const express = require('express');
const router = express.Router();
const { getProperties, getPropertyById, createProperty, updateProperty, deleteProperty, batchUpdateProperty } = require('../controllers/propertyController');
const { protect } = require('../middleware/auth');

// 获取房产列表（公开路由）
router.get('/', getProperties);

// 获取单个房产详情（公开路由）
router.get('/:id', getPropertyById);

// 创建新房产（需要认证）
router.post('/', protect, createProperty);

// 更新房产信息（需要认证）
router.put('/:id', protect, updateProperty);

// 删除房产（需要认证）
router.delete('/:id', protect, deleteProperty);

// 批量更新房产信息（需要认证）
router.post('/batch-update', protect, batchUpdateProperty);

module.exports = router;