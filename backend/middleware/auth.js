const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

// 保护路由，验证用户身份
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 从请求头中获取token
      token = req.headers.authorization.split(' ')[1];
      
      // 验证token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 获取用户信息，但不包含密码
      req.user = await User.findById(decoded.id).select('-password');
      
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: '无效的认证令牌' });
    }
  }
  
  if (!token) {
    res.status(401).json({ message: '未提供认证令牌' });
  }
};

// 基于角色的访问控制中间件
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: '未认证' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: '无权限访问此资源' });
    }
    
    next();
  };
};

// 基于权限的访问控制中间件
const checkPermission = (permission) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: '未认证' });
    }
    
    // 特殊角色拥有所有权限
    if (req.user.role === 'government' || req.user.role === 'admin') {
      return next();
    }
    
    // 个人用户只有基础权限
    if (req.user.role === 'personal') {
      const personalPermissions = [
        'view_properties',
        'create_properties',
        'edit_properties',
        'delete_properties',
        'view_valuations',
        'create_valuations'
      ];
      
      if (!personalPermissions.includes(permission)) {
        return res.status(403).json({ message: '无权限访问此资源' });
      }
      
      return next();
    }
    
    // 企业用户需要检查具体权限
    if (req.user.role === 'enterprise' || req.user.role === 'association' || req.user.role === 'academic') {
      // 这里可以根据企业和团队关系检查更细粒度的权限
      // 暂时实现基本的权限检查
      const enterprisePermissions = [
        'view_properties',
        'create_properties',
        'edit_properties',
        'delete_properties',
        'view_valuations',
        'create_valuations',
        'batch_valuations',
        'view_reports',
        'create_reports',
        'manage_api_keys' // 添加管理API Key的权限
      ];
      
      if (!enterprisePermissions.includes(permission)) {
        return res.status(403).json({ message: '无权限访问此资源' });
      }
      
      return next();
    }
    
    res.status(403).json({ message: '无权限访问此资源' });
  };
};

module.exports = { protect, authorize, checkPermission };