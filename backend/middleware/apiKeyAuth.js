const ApiKey = require('../models/ApiKey');

// API Key认证和速率限制中间件
const apiKeyAuth = async (req, res, next) => {
  // 从请求头中获取API Key
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  
  if (!apiKey) {
    return res.status(401).json({ message: '未提供API Key' });
  }
  
  try {
    // 查找并验证API Key
    const keyRecord = await ApiKey.findByKey(apiKey);
    
    if (!keyRecord) {
      return res.status(401).json({ message: '无效的API Key' });
    }
    
    // 检查API Key是否过期
    if (keyRecord.expiresAt && new Date(keyRecord.expiresAt) < new Date()) {
      return res.status(401).json({ message: 'API Key已过期' });
    }
    
    // 检查API Key是否被撤销
    if (keyRecord.status !== 'active') {
      return res.status(401).json({ message: 'API Key已被撤销' });
      }
    
    // 检查速率限制
    const rateLimitResult = await keyRecord.isRateLimited();
    
    if (rateLimitResult.limited) {
      return res.status(429).json({
        message: `API调用频率超过限制，${rateLimitResult.reason}限制为${rateLimitResult.limit}次/分钟`,
        error: 'TOO_MANY_REQUESTS',
        limit: rateLimitResult.limit,
        retryAfter: rateLimitResult.reason === 'per_minute' ? 60 : 
                   rateLimitResult.reason === 'per_hour' ? 3600 : 86400
      });
    }
    
    // 将API Key记录添加到请求对象中
    req.apiKey = keyRecord;
    
    // 更新API Key使用统计
    await keyRecord.updateUsage();
    
    next();
  } catch (error) {
    console.error('API Key认证错误:', error);
    res.status(500).json({ message: 'API Key认证过程中发生错误' });
  }
};

module.exports = apiKeyAuth;
