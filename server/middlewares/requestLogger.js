// 请求日志中间件

/**
 * 创建请求日志中间件
 * @param {Object} options - 日志选项
 * @param {string} options.level - 日志级别：'info', 'debug', 'warn', 'error'
 * @param {boolean} options.logHeaders - 是否记录请求头
 * @param {boolean} options.logBody - 是否记录请求体
 * @param {boolean} options.logQuery - 是否记录查询参数
 * @param {Array} options.skipPaths - 跳过记录的路径列表
 * @returns {Function} - Express中间件函数
 */
const createRequestLogger = (options = {}) => {
  const {
    level = 'info', // 默认日志级别
    logHeaders = true, // 默认记录请求头
    logBody = false, // 默认不记录请求体
    logQuery = true, // 默认记录查询参数
    skipPaths = [] // 默认不跳过任何路径
  } = options;
  
  // 日志级别对应的console方法
  const logMethods = {
    info: console.log,
    debug: console.debug,
    warn: console.warn,
    error: console.error
  };
  
  // 获取日志方法
  const log = logMethods[level] || console.log;
  
  return (req, res, next) => {
    // 检查是否需要跳过日志记录
    if (skipPaths.some(path => req.originalUrl.startsWith(path))) {
      return next();
    }
    
    const startTime = Date.now();
    
    // 构建请求日志对象
    const requestLog = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      timestamp: new Date().toISOString()
    };
    
    // 添加请求头
    if (logHeaders) {
      requestLog.headers = {
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type'],
        'accept': req.headers['accept'],
        'referer': req.headers['referer'],
        'x-forwarded-for': req.headers['x-forwarded-for']
      };
    }
    
    // 添加查询参数
    if (logQuery && Object.keys(req.query).length > 0) {
      requestLog.query = req.query;
    }
    
    // 添加请求体（仅当请求方法不是GET且日志级别为debug时记录）
    if (logBody && req.method !== 'GET' && level === 'debug') {
      requestLog.body = req.body;
    }
    
    // 记录请求信息
    log('新请求:', requestLog);
    
    // 监听响应完成事件，记录响应时间和状态码
    res.on('finish', () => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // 构建响应日志对象
      const responseLog = {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        responseTime: `${responseTime}ms`,
        contentLength: res.getHeader('content-length') || 0,
        timestamp: new Date().toISOString()
      };
      
      // 根据状态码选择日志级别
      let responseLogMethod = log;
      if (res.statusCode >= 500) {
        responseLogMethod = console.error;
      } else if (res.statusCode >= 400) {
        responseLogMethod = console.warn;
      } else if (res.statusCode >= 300) {
        responseLogMethod = console.info;
      }
      
      // 记录响应信息
      responseLogMethod('请求处理完成:', responseLog);
    });
    
    next();
  };
};

/**
 * 默认请求日志中间件（使用info级别，记录请求头和查询参数，不记录请求体）
 */
const requestLogger = createRequestLogger();

/**
 * 调试日志中间件（使用debug级别，记录所有请求信息，包括请求体）
 */
const debugLogger = createRequestLogger({
  level: 'debug',
  logHeaders: true,
  logBody: true,
  logQuery: true
});

/**
 * 生产环境日志中间件（使用info级别，仅记录关键信息，跳过静态文件路径）
 */
const productionLogger = createRequestLogger({
  level: 'info',
  logHeaders: false,
  logBody: false,
  logQuery: false,
  skipPaths: ['/public', '/assets', '/static', '/images', '/css', '/js']
});

export {
  requestLogger,
  createRequestLogger,
  debugLogger,
  productionLogger
};