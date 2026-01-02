const express = require('express');
const router = express.Router();
const {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogStats,
  publishBlog,
  archiveBlog,
  getBlogTags
} = require('../controllers/blogController');
const { protect, authorize } = require('../middleware/auth');

// 获取博客列表（公开路由）
router.get('/', getBlogs);

// 获取博客详情（公开路由）
router.get('/:id', getBlogById);

// 获取博客统计（需要认证）
router.get('/stats', protect, getBlogStats);

// 获取博客标签列表（公开路由）
router.get('/tags', getBlogTags);

// 创建博客（需要认证）
router.post('/', protect, createBlog);

// 更新博客（需要认证）
router.put('/:id', protect, updateBlog);

// 删除博客（需要认证）
router.delete('/:id', protect, deleteBlog);

// 发布博客（需要认证）
router.put('/:id/publish', protect, publishBlog);

// 归档博客（需要认证）
router.put('/:id/archive', protect, archiveBlog);

module.exports = router;