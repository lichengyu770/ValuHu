// 请求限流中间件
import { errorResponse } from '../utils/response.js';

/**
 * 创建请求限流中间件
 * @param {Object} options - 限流选项
 * @param {number} options.max - 时间窗口内的最大请求数
 * @param {number} options.windowMs - 时间窗口大小（毫秒）
 * @param {string} options.message - 限流提示信息
 * @param {Function} options.keyGenerator - 生成限流键的函数
 * @param {Function} options.skip - 是否跳过限流的函数
 * @param {Function} options.onLimitReached - 达到限流时的回调函数
 * @returns {Function} - Express中间件函数
 */
const rateLimiter = (options = {}) => {
  const {
    max = 100, // 时间窗口内的最大请求数
    windowMs = 60 * 1000, // 时间窗口大小（毫秒）
    message = '请求频率过高，请稍后重试',
    keyGenerator = (req) => req.ip, // 默认使用IP作为限流键
    skip = (req) => false, // 默认不跳过任何请求
    onLimitReached = (req) => {} // 默认达到限流时不执行任何操作
  } = options;
  
  // 存储请求记录的对象
  const requestStore = new Map();
  
  return (req, res, next) => {
    try {
      // 检查是否需要跳过限流
      if (skip(req)) {
        return next();
      }
      
      // 生成限流键
      const key = keyGenerator(req);
      const now = Date.now();
      const windowStart = now - windowMs;
      
      // 获取当前键的请求记录
      let requests = requestStore.get(key) || [];
      
      // 移除时间窗口外的请求记录
      requests = requests.filter(timestamp => timestamp >= windowStart);
      
      // 检查是否超过限制
      if (requests.length >= max) {
        // 执行限流回调
        onLimitReached(req);
        
        // 请求过于频繁，返回429状态码
        return errorResponse(res, message, 429);
      }
      
      // 添加当前请求时间戳
      requests.push(now);
      requestStore.set(key, requests);
      
      // 设置响应头，提示剩余请求数和重置时间
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', max - requests.length);
      res.setHeader('X-RateLimit-Reset', windowStart + windowMs);
      
      // 设置Retry-After头，提示客户端何时可以重试
      res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
      
      next();
    } catch (error) {
      console.error('限流中间件错误:', error);
      next(); // 限流中间件错误不应影响请求处理
    }
  };
};

/**
 * 针对特定路由的限流中间件
 * @param {Object} options - 限流选项
 * @returns {Function} - Express中间件函数
 */
const routeRateLimiter = (options) => {
  return rateLimiter({
    max: 10, // 更严格的路由级限制
    windowMs: 60 * 1000,
    message: '该接口请求频率过高，请稍后重试',
    ...options
  });
};

/**
 * 针对认证接口的限流中间件
 * @param {Object} options - 限流选项
 * @returns {Function} - Express中间件函数
 */
const authRateLimiter = (options) => {
  return rateLimiter({
    max: 5, // 认证接口更严格的限制
    windowMs: 60 * 1000,
    message: '认证请求频率过高，请稍后重试',
    keyGenerator: (req) => {
      // 使用IP和用户名/手机号组合作为限流键
      return `${req.ip}-${req.body.username || req.body.phone || req.body.email || 'unknown'}`;
    },
    ...options
  });
};

/**
 * 针对API接口的限流中间件
 * @param {Object} options - 限流选项
 * @returns {Function} - Express中间件函数
 */
const apiRateLimiter = (options) => {
  return rateLimiter({
    max: 50,
    windowMs: 60 * 1000,
    message: 'API请求频率过高，请稍后重试',
    keyGenerator: (req) => {
      // 使用IP和API路径组合作为限流键
      return `${req.ip}-${req.path}`;
    },
    ...options
  });
};

export {
  rateLimiter,
  routeRateLimiter,
  authRateLimiter,
  apiRateLimiter
};