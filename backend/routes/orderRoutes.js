const express = require('express');
const router = express.Router();
const { getOrders, getOrderById, createOrder, updateOrderStatus, deleteOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

// 获取订单列表（需要认证）
router.get('/', protect, getOrders);

// 获取单个订单详情（需要认证）
router.get('/:id', protect, getOrderById);

// 创建新订单（需要认证）
router.post('/', protect, createOrder);

// 更新订单状态（需要认证）
router.put('/:id', protect, updateOrderStatus);

// 删除订单（需要认证）
router.delete('/:id', protect, deleteOrder);

module.exports = router;