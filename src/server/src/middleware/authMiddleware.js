const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 生成JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      role: user.role,
      permissions: user.permissions,
    },
    process.env.JWT_SECRET || 'your-secret-key',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    }
  );
};

// 验证JWT token
const verifyToken = (req, res, next) => {
  // 从请求头获取token
  const authHeader = req.header('Authorization');

  // 处理Bearer token格式
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      code: 401,
      message: 'Access denied. No token provided.',
    });
  }

  try {
    // 验证token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    );

    // 将用户信息存储到请求对象中
    req.user = decoded;
    next();
  } catch (error) {
    // 处理无效token
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        code: 401,
        message: 'Token has expired.',
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        code: 401,
        message: 'Invalid token.',
      });
    } else {
      return res.status(401).json({
        code: 401,
        message: 'Authentication failed.',
      });
    }
  }
};

// 验证用户是否具有特定权限
const requirePermission = (permission) => {
  return (req, res, next) => {
    // 检查用户是否存在
    if (!req.user) {
      return res.status(401).json({
        code: 401,
        message: 'Authentication required.',
      });
    }

    // 管理员拥有所有权限
    if (req.user.role === 'admin') {
      return next();
    }

    // 检查用户是否具有指定权限
    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      return res.status(403).json({
        code: 403,
        message: 'Permission denied. You do not have access to this resource.',
      });
    }

    next();
  };
};

// 验证用户是否为特定角色
const requireRole = (role) => {
  return (req, res, next) => {
    // 检查用户是否存在
    if (!req.user) {
      return res.status(401).json({
        code: 401,
        message: 'Authentication required.',
      });
    }

    // 检查用户角色
    if (req.user.role !== role) {
      return res.status(403).json({
        code: 403,
        message: 'Permission denied. You do not have the required role.',
      });
    }

    next();
  };
};

// 检查用户是否为管理员
const requireAdmin = requireRole('admin');

module.exports = {
  generateToken,
  verifyToken,
  requirePermission,
  requireRole,
  requireAdmin,
};
