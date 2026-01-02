const express = require('express');
const router = express.Router();
const { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } = require('../controllers/testimonialController');
const { protect } = require('../middleware/auth');

// 获取评价列表（公开路由）
router.get('/', getTestimonials);

// 创建新评价（需要认证）
router.post('/', protect, createTestimonial);

// 更新评价（需要认证）
router.put('/:id', protect, updateTestimonial);

// 删除评价（需要认证）
router.delete('/:id', protect, deleteTestimonial);

module.exports = router;