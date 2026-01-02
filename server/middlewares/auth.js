// 权限验证中间件
import { unauthorizedResponse, forbiddenResponse } from '../utils/response.js';

/**
 * 验证用户身份
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一步函数
 */
const authenticate = (req, res, next) => {
  try {
    // 从请求头获取授权信息
    const authHeader = req.headers.authorization;
    
    // 简单的身份验证逻辑，实际生产环境应使用更安全的方法（如JWT）
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorizedResponse(res, '未授权访问');
    }
    
    // 验证token（这里只是简单示例，实际应验证真实token）
    const token = authHeader.split(' ')[1];
    if (!token || token.length < 5) {
      return unauthorizedResponse(res, '无效的授权token');
    }
    
    // 模拟解析JWT token，提取用户信息
    req.user = {
      id: '1',
      username: 'testuser',
      role: 'user',
      permissions: ['read', 'write']
    };
    
    // 身份验证通过，继续处理请求
    next();
  } catch (error) {
    console.error('身份验证失败:', error);
    return unauthorizedResponse(res, '身份验证失败');
  }
};

/**
 * 验证管理员权限
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一步函数
 */
const authorizeAdmin = (req, res, next) => {
  try {
    // 从请求头获取授权信息
    const authHeader = req.headers.authorization;
    
    // 简单的管理员验证逻辑，实际生产环境应使用更安全的方法
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorizedResponse(res, '未授权访问');
    }
    
    // 验证管理员token（这里只是简单示例，实际应验证真实token）
    const token = authHeader.split(' ')[1];
    if (!token || token !== 'admin-token') {
      return forbiddenResponse(res, '无权访问该资源');
    }
    
    // 模拟解析JWT token，提取管理员信息
    req.user = {
      id: '0',
      username: 'admin',
      role: 'admin',
      permissions: ['read', 'write', 'admin']
    };
    
    // 管理员权限验证通过，继续处理请求
    next();
  } catch (error) {
    console.error('管理员权限验证失败:', error);
    return forbiddenResponse(res, '管理员权限验证失败');
  }
};

/**
 * 验证用户角色
 * @param {Array} roles - 允许的角色列表
 * @returns {Function} - Express中间件函数
 */
const authorizeRole = (roles) => {
  return (req, res, next) => {
    try {
      // 检查用户是否已通过身份验证
      if (!req.user || !req.user.role) {
        return unauthorizedResponse(res, '未授权访问');
      }
      
      // 检查用户角色是否在允许的角色列表中
      if (!roles.includes(req.user.role)) {
        return forbiddenResponse(res, '无权访问该资源');
      }
      
      // 角色验证通过，继续处理请求
      next();
    } catch (error) {
      console.error('角色验证失败:', error);
      return forbiddenResponse(res, '角色验证失败');
    }
  };
};

/**
 * 验证用户权限
 * @param {Array} permissions - 允许的权限列表
 * @returns {Function} - Express中间件函数
 */
const authorizePermission = (permissions) => {
  return (req, res, next) => {
    try {
      // 检查用户是否已通过身份验证
      if (!req.user || !req.user.permissions) {
        return unauthorizedResponse(res, '未授权访问');
      }
      
      // 检查用户是否具有所需的权限
      const hasPermission = permissions.some(permission => req.user.permissions.includes(permission));
      if (!hasPermission) {
        return forbiddenResponse(res, '无权访问该资源');
      }
      
      // 权限验证通过，继续处理请求
      next();
    } catch (error) {
      console.error('权限验证失败:', error);
      return forbiddenResponse(res, '权限验证失败');
    }
  };
};

export {
  authenticate,
  authorizeAdmin,
  authorizeRole,
  authorizePermission
};