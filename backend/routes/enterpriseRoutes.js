const express = require('express');
const router = express.Router();
const { 
  createEnterprise, 
  getEnterprises, 
  getEnterprise, 
  updateEnterprise, 
  deleteEnterprise, 
  addEnterpriseAdmin, 
  removeEnterpriseAdmin 
} = require('../controllers/enterpriseController');
const { protect, authorize } = require('../middleware/auth');

// 企业管理路由
router.use(protect); // 所有企业路由都需要认证

// 创建企业 - 所有认证用户
router.post('/', createEnterprise);

// 获取企业列表 - 管理员和政府用户
router.get('/', authorize('admin', 'government'), getEnterprises);

// 获取企业详情 - 企业成员、管理员和政府用户
router.get('/:id', getEnterprise);

// 更新企业信息 - 企业管理员和系统管理员
router.put('/:id', updateEnterprise);

// 删除企业 - 企业创建者和系统管理员
router.delete('/:id', deleteEnterprise);

// 添加企业管理员 - 企业创建者和系统管理员
router.post('/:id/admins', addEnterpriseAdmin);

// 移除企业管理员 - 企业创建者和系统管理员
router.delete('/:id/admins', removeEnterpriseAdmin);

module.exports = router;
