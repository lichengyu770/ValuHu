// 异常处理中间件
import { errorResponse, serverErrorResponse, notFoundResponse, unauthorizedResponse, forbiddenResponse } from '../utils/response.js';

/**
 * 统一错误处理
 * @param {Error} err - 错误对象
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一步函数
 */
const errorHandler = (err, req, res, next) => {
  console.error('请求处理错误:', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    error: err.message,
    stack: err.stack
  });
  
  // 处理不同类型的错误
  if (err.name === 'ValidationError') {
    // 验证错误
    return errorResponse(res, '请求参数验证失败', 400, err.errors);
  }
  
  if (err.name === 'UnauthorizedError') {
    // 授权错误
    return unauthorizedResponse(res, err.message || '未授权访问');
  }
  
  if (err.name === 'ForbiddenError') {
    // 禁止访问错误
    return forbiddenResponse(res, err.message || '无权访问该资源');
  }
  
  if (err.name === 'NotFoundError') {
    // 资源不存在错误
    return notFoundResponse(res, err.message || '请求的资源不存在');
  }
  
  if (err.name === 'DatabaseError') {
    // 数据库错误
    return errorResponse(res, err.message || '数据库操作失败', 500);
  }
  
  if (err.name === 'RateLimitError') {
    // 限流错误
    return errorResponse(res, err.message || '请求频率过高，请稍后重试', 429);
  }
  
  if (err.name === 'TimeoutError') {
    // 超时错误
    return errorResponse(res, err.message || '请求超时，请稍后重试', 504);
  }
  
  if (err.name === 'InternalServerError') {
    // 内部服务器错误
    return serverErrorResponse(res, err.message);
  }
  
  // 其他未分类错误
  return serverErrorResponse(res, err.message);
};

/**
 * 404资源不存在处理
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一步函数
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`请求的资源 ${req.originalUrl} 不存在`);
  error.name = 'NotFoundError';
  next(error);
};

/**
 * 创建自定义错误
 * @param {string} message - 错误消息
 * @param {string} name - 错误名称
 * @param {number} statusCode - 状态码
 * @returns {Error} - 自定义错误对象
 */
const createError = (message, name = 'Error', statusCode = 500) => {
  const error = new Error(message);
  error.name = name;
  error.statusCode = statusCode;
  return error;
};

export {
  errorHandler,
  notFoundHandler,
  createError
};