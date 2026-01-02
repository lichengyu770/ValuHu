const express = require('express');
const router = express.Router();
const { getTemplates, getTemplateById, createTemplate, updateTemplate, deleteTemplate } = require('../controllers/templateController');
const { protect } = require('../middleware/auth');

// 获取模板列表（公开路由）
router.get('/', getTemplates);

// 获取单个模板详情（公开路由）
router.get('/:id', getTemplateById);

// 创建新模板（需要认证）
router.post('/', protect, createTemplate);

// 更新模板（需要认证）
router.put('/:id', protect, updateTemplate);

// 删除模板（需要认证）
router.delete('/:id', protect, deleteTemplate);

module.exports = router;