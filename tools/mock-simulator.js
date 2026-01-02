// Mock接口异常模拟工具
// 支持模拟多种接口异常场景，用于测试系统的错误处理机制

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const app = express();
const PORT = process.env.SIMULATOR_PORT || 3002;

// 中间件配置
app.use(helmet());
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 统一响应格式
const sendResponse = (res, code, message, data = null, errors = null) => {
  const response = {
    code,
    message,
    data,
    timestamp: new Date().toISOString(),
  };

  if (errors) {
    response.errors = errors;
  }

  res.status(code).json(response);
};

// -------------------- 异常场景模拟接口 --------------------

/**
 * 模拟接口超时场景
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
app.all('/simulate/timeout/:delay?', (req, res) => {
  const delay = parseInt(req.params.delay) || 3000; // 默认3秒超时
  console.log(`模拟超时场景，延迟${delay}ms`);

  setTimeout(() => {
    sendResponse(res, 200, 'success', {
      message: `请求已延迟${delay}ms`,
      timeoutSimulated: true,
    });
  }, delay);
});

/**
 * 模拟参数验证错误场景
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
app.all('/simulate/validation-error', (req, res) => {
  console.log('模拟参数验证错误场景');

  const errors = [
    {
      field: 'area',
      message: '面积必须大于0',
    },
    {
      field: 'floor',
      message: '所在楼层不能超过总楼层',
    },
    {
      field: 'building_year',
      message: '建筑年份必须在1900到2025之间',
    },
  ];

  sendResponse(res, 400, '参数验证失败', null, errors);
});

/**
 * 模拟服务器错误场景
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
app.all('/simulate/server-error', (req, res) => {
  console.log('模拟服务器错误场景');

  sendResponse(res, 500, '服务器内部错误，请稍后重试');
});

/**
 * 模拟网关超时场景
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
app.all('/simulate/gateway-timeout', (req, res) => {
  console.log('模拟网关超时场景');

  sendResponse(res, 504, '网关超时，请稍后重试');
});

/**
 * 模拟未授权访问场景
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
app.all('/simulate/unauthorized', (req, res) => {
  console.log('模拟未授权访问场景');

  sendResponse(res, 401, '未授权访问，请先登录');
});

/**
 * 模拟禁止访问场景
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
app.all('/simulate/forbidden', (req, res) => {
  console.log('模拟禁止访问场景');

  sendResponse(res, 403, '禁止访问，您没有权限执行此操作');
});

/**
 * 模拟资源不存在场景
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
app.all('/simulate/not-found', (req, res) => {
  console.log('模拟资源不存在场景');

  sendResponse(res, 404, '请求的资源不存在');
});

/**
 * 模拟返回数据格式异常场景
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
app.all('/simulate/invalid-format', (req, res) => {
  console.log('模拟返回数据格式异常场景');

  // 返回HTML格式而不是JSON
  res.setHeader('Content-Type', 'text/html');
  res.send(
    '<html><body><h1>Invalid Response Format</h1><p>This is not a valid JSON response.</p></body></html>'
  );
});

/**
 * 模拟返回数据类型错误场景
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
app.all('/simulate/invalid-type', (req, res) => {
  console.log('模拟返回数据类型错误场景');

  // 返回数组而不是对象
  res.json([{ error: 'This should be an object, not an array' }]);
});

/**
 * 模拟返回数据缺失必填字段场景
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
app.all('/simulate/missing-fields', (req, res) => {
  console.log('模拟返回数据缺失必填字段场景');

  // 缺少必填字段的响应
  sendResponse(res, 200, 'success', {
    // 缺少price和unitPrice字段
    reportId: 'EST-12345',
  });
});

/**
 * 模拟返回错误的字段类型场景
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
app.all('/simulate/wrong-type', (req, res) => {
  console.log('模拟返回错误的字段类型场景');

  sendResponse(res, 200, 'success', {
    price: 'string instead of number', // 应该是数字，实际返回字符串
    unitPrice: 8333,
    reportId: 12345, // 应该是字符串，实际返回数字
  });
});

/**
 * 批量模拟多种异常场景
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
app.post('/simulate/batch', (req, res) => {
  const { scenarios } = req.body;

  if (!Array.isArray(scenarios) || scenarios.length === 0) {
    return sendResponse(res, 400, 'scenarios参数必须是包含至少一个场景的数组');
  }

  console.log(`批量模拟${scenarios.length}种异常场景`);

  // 模拟结果
  const results = [];

  scenarios.forEach((scenario, index) => {
    try {
      // 这里可以根据场景类型执行不同的模拟逻辑
      // 由于是批量模拟，我们返回模拟计划，而不是实际执行
      results.push({
        index,
        scenario,
        status: 'scheduled',
        message: `已安排模拟${scenario}场景`,
      });
    } catch (error) {
      results.push({
        index,
        scenario,
        status: 'failed',
        message: `模拟${scenario}场景失败: ${error.message}`,
      });
    }
  });

  sendResponse(res, 200, '批量模拟计划已创建', results);
});

/**
 * 获取支持的异常场景列表
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
app.get('/simulate/scenarios', (req, res) => {
  const scenarios = [
    {
      name: 'timeout',
      path: '/simulate/timeout/:delay?',
      description: '模拟接口超时场景',
      method: 'GET, POST, PUT, DELETE',
      params: {
        delay: '可选，超时延迟时间（毫秒），默认3000',
      },
    },
    {
      name: 'validation-error',
      path: '/simulate/validation-error',
      description: '模拟参数验证错误场景',
      method: 'GET, POST, PUT, DELETE',
    },
    {
      name: 'server-error',
      path: '/simulate/server-error',
      description: '模拟服务器内部错误场景',
      method: 'GET, POST, PUT, DELETE',
    },
    {
      name: 'gateway-timeout',
      path: '/simulate/gateway-timeout',
      description: '模拟网关超时场景',
      method: 'GET, POST, PUT, DELETE',
    },
    {
      name: 'unauthorized',
      path: '/simulate/unauthorized',
      description: '模拟未授权访问场景',
      method: 'GET, POST, PUT, DELETE',
    },
    {
      name: 'forbidden',
      path: '/simulate/forbidden',
      description: '模拟禁止访问场景',
      method: 'GET, POST, PUT, DELETE',
    },
    {
      name: 'not-found',
      path: '/simulate/not-found',
      description: '模拟资源不存在场景',
      method: 'GET, POST, PUT, DELETE',
    },
    {
      name: 'invalid-format',
      path: '/simulate/invalid-format',
      description: '模拟返回数据格式异常场景',
      method: 'GET, POST, PUT, DELETE',
    },
    {
      name: 'invalid-type',
      path: '/simulate/invalid-type',
      description: '模拟返回数据类型错误场景',
      method: 'GET, POST, PUT, DELETE',
    },
    {
      name: 'missing-fields',
      path: '/simulate/missing-fields',
      description: '模拟返回数据缺失必填字段场景',
      method: 'GET, POST, PUT, DELETE',
    },
    {
      name: 'wrong-type',
      path: '/simulate/wrong-type',
      description: '模拟返回错误的字段类型场景',
      method: 'GET, POST, PUT, DELETE',
    },
    {
      name: 'batch',
      path: '/simulate/batch',
      description: '批量模拟多种异常场景',
      method: 'POST',
      body: {
        scenarios: '要模拟的场景列表，如["timeout", "server-error"]',
      },
    },
  ];

  sendResponse(res, 200, '支持的异常场景列表', scenarios);
});

/**
 * 健康检查接口
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
app.get('/simulate/health', (req, res) => {
  sendResponse(res, 200, 'Mock异常模拟工具运行正常', {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    port: PORT,
    scenariosCount: 11,
  });
});

// 404处理
app.use('*', (req, res) => {
  sendResponse(res, 404, '请求的模拟接口不存在');
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('模拟工具错误:', err.stack);
  sendResponse(res, 500, '模拟工具内部错误');
});

// 启动模拟工具服务器
app.listen(PORT, () => {
  console.log('\n==========================================');
  console.log('Mock接口异常模拟工具已启动');
  console.log(`运行地址: http://localhost:${PORT}`);
  console.log('==========================================');
  console.log('\n可用的异常模拟场景:');
  console.log('------------------------------------------');
  console.log('GET /simulate/scenarios          - 获取支持的异常场景列表');
  console.log('GET /simulate/health             - 健康检查');
  console.log('\n异常场景模拟接口:');
  console.log('------------------------------------------');
  console.log('GET /simulate/timeout/:delay?    - 模拟接口超时');
  console.log('GET /simulate/validation-error   - 模拟参数验证错误');
  console.log('GET /simulate/server-error       - 模拟服务器错误');
  console.log('GET /simulate/gateway-timeout    - 模拟网关超时');
  console.log('GET /simulate/unauthorized       - 模拟未授权访问');
  console.log('GET /simulate/forbidden          - 模拟禁止访问');
  console.log('GET /simulate/not-found          - 模拟资源不存在');
  console.log('GET /simulate/invalid-format     - 模拟返回数据格式异常');
  console.log('GET /simulate/invalid-type       - 模拟返回数据类型错误');
  console.log('GET /simulate/missing-fields     - 模拟返回数据缺失必填字段');
  console.log('GET /simulate/wrong-type         - 模拟返回错误的字段类型');
  console.log('POST /simulate/batch             - 批量模拟多种异常场景');
  console.log('\n==========================================');
});

// 处理退出信号
process.on('SIGINT', () => {
  console.log('\n正在关闭Mock异常模拟工具...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n正在关闭Mock异常模拟工具...');
  process.exit(0);
});

/**
 * 命令行使用示例：
 *
 * # 启动模拟工具
 * node mock-simulator.js
 *
 * # 测试超时场景（延迟2秒）
 * curl http://localhost:3002/simulate/timeout/2000
 *
 * # 测试参数验证错误场景
 * curl http://localhost:3002/simulate/validation-error
 *
 * # 测试服务器错误场景
 * curl http://localhost:3002/simulate/server-error
 *
 * # 获取支持的场景列表
 * curl http://localhost:3002/simulate/scenarios
 */
