const express = require('express');
const router = express.Router();
const { 
  createApiKey, 
  getApiKeys, 
  getApiKeyById, 
  updateApiKey, 
  deleteApiKey, 
  getApiKeyStats 
} = require('../controllers/apiKeyController');
const { protect, authorize, checkPermission } = require('../middleware/auth');

// API Key 路由
router.use(protect); // 所有API Key路由都需要认证

// 申请API Key - 需要企业/协会/学术用户权限
router.post('/', 
  authorize('enterprise', 'association', 'academic', 'government'), 
  checkPermission('manage_api_keys'),
  createApiKey
);

// 获取API Key列表 - 所有认证用户
router.get('/', getApiKeys);

// 获取单个API Key详情 - 所有认证用户
router.get('/:id', getApiKeyById);

// 更新API Key - 需要企业/协会/学术用户权限
router.put('/:id', 
  authorize('enterprise', 'association', 'academic', 'government'), 
  checkPermission('manage_api_keys'),
  updateApiKey
);

// 删除API Key - 需要企业/协会/学术用户权限
router.delete('/:id', 
  authorize('enterprise', 'association', 'academic', 'government'), 
  checkPermission('manage_api_keys'),
  deleteApiKey
);

// 获取API Key使用统计 - 所有认证用户
router.get('/:id/stats', getApiKeyStats);

module.exports = router;
