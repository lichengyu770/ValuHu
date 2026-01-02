// Mock服务器实现
// 基于Express.js开发，支持RESTful API模拟和特殊场景模拟

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

// 创建Express应用
const app = express();
const PORT = process.env.MOCK_PORT || 3001;

// 中间件配置
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP最多100个请求
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 429, message: '请求过于频繁，请稍后再试' },
});
app.use(limiter);

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

// 生成随机估价报告ID
const generateReportId = () => {
  const prefix = 'EST';
  const random = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${random}`;
};

// 生成随机估价结果
const generateValuationResult = (params) => {
  // 基础单价（根据城市和区域调整）
  const basePrices = {
    长沙: {
      岳麓区: 15000,
      芙蓉区: 18000,
      天心区: 16000,
    },
    北京: {
      朝阳区: 80000,
      海淀区: 90000,
    },
    上海: {
      浦东新区: 75000,
      黄浦区: 110000,
    },
  };

  const cityPrice = basePrices[params.city] || { 默认: 10000 };
  const districtPrice = cityPrice[params.district] || 10000;

  // 根据楼层调整单价
  const floorFactor = params.floor / params.total_floors;
  const adjustedPrice = districtPrice * (0.9 + floorFactor * 0.2);

  // 计算总价
  const price = Math.round(adjustedPrice * params.area);
  const unitPrice = Math.round(adjustedPrice);

  return {
    price,
    unitPrice,
    reportId: generateReportId(),
    confidenceLevel: Math.floor(80 + Math.random() * 15), // 80-95之间的随机值
    valuationMethod: '市场比较法',
    timestamp: new Date().toISOString(),
  };
};

// 估价接口参数验证规则
const valuationValidationRules = [
  body('area').isFloat({ gt: 0 }).withMessage('面积必须大于0'),
  body('city').notEmpty().withMessage('城市名称不能为空'),
  body('district').notEmpty().withMessage('区域名称不能为空'),
  body('rooms').notEmpty().withMessage('户型不能为空'),
  body('floor').isInt({ gt: 0 }).withMessage('所在楼层必须大于0'),
  body('total_floors').isInt({ gt: 0 }).withMessage('总楼层必须大于0'),
  body('building_year')
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage(`建筑年份必须在1900到${new Date().getFullYear() + 1}之间`),
  body('property_type')
    .isIn(['住宅', '商业', '工业'])
    .withMessage('房产类型必须是住宅、商业或工业'),
  body('orientation').notEmpty().withMessage('朝向不能为空'),
  body('decoration')
    .isIn(['毛坯', '简装', '中装', '精装', '豪装'])
    .withMessage('装修情况必须是毛坯、简装、中装、精装或豪装'),
];

// -------------------- 估价接口 --------------------

// 正常估价接口
app.post('/api/estimate', valuationValidationRules, (req, res) => {
  // 验证请求参数
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return sendResponse(res, 400, '参数验证失败', null, errorMessages);
  }

  // 生成估价结果
  const result = generateValuationResult(req.body);

  // 返回成功响应
  sendResponse(res, 200, 'success', result);
});

// 基础Mock接口（固定响应）
app.post('/api/estimate/fixed', (req, res) => {
  const response = {
    price: 1250000,
    unitPrice: 8333,
    reportId: 'EST-12345',
    confidenceLevel: 90,
    valuationMethod: '市场比较法',
    timestamp: new Date().toISOString(),
  };
  sendResponse(res, 200, 'success', response);
});

// -------------------- 特殊场景模拟接口 --------------------

// 接口超时模拟
app.post('/api/estimate/timeout', valuationValidationRules, (req, res) => {
  // 验证请求参数
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return sendResponse(res, 400, '参数验证失败', null, errorMessages);
  }

  // 模拟10秒超时
  setTimeout(() => {
    const result = generateValuationResult(req.body);
    sendResponse(res, 200, 'success', result);
  }, 10000);
});

// 参数验证错误模拟
app.post('/api/estimate/validation-error', (req, res) => {
  const errors = [
    { field: 'area', message: '面积必须大于0' },
    { field: 'floor', message: '所在楼层不能超过总楼层' },
  ];
  sendResponse(res, 400, '参数验证失败', null, errors);
});

// 返回数据格式异常模拟
app.post('/api/estimate/invalid-format', (req, res) => {
  // 返回异常格式数据
  res.send('<html><body>Invalid response format</body></html>');
});

// 服务器错误模拟
app.post('/api/estimate/server-error', (req, res) => {
  sendResponse(res, 500, '服务器内部错误，请稍后重试');
});

// 网关超时模拟
app.post('/api/estimate/gateway-timeout', (req, res) => {
  sendResponse(res, 504, '网关超时，请稍后重试');
});

// 未授权访问模拟
app.post('/api/estimate/unauthorized', (req, res) => {
  sendResponse(res, 401, '未授权访问，请先登录');
});

// 禁止访问模拟
app.post('/api/estimate/forbidden', (req, res) => {
  sendResponse(res, 403, '禁止访问，您没有权限执行此操作');
});

// 资源不存在模拟
app.post('/api/estimate/not-found', (req, res) => {
  sendResponse(res, 404, '请求的资源不存在');
});

// -------------------- 批量估价接口 --------------------

app.post('/api/estimate/batch', (req, res) => {
  const requests = req.body.requests || [];

  if (!Array.isArray(requests) || requests.length === 0) {
    return sendResponse(res, 400, '请求参数必须是包含至少一个请求的数组');
  }

  if (requests.length > 100) {
    return sendResponse(res, 400, '批量请求数量不能超过100个');
  }

  // 生成批量估价结果
  const results = requests.map((params, index) => {
    try {
      // 简单验证
      if (!params.area || params.area <= 0) {
        return {
          index,
          success: false,
          error: '面积必须大于0',
        };
      }

      const result = generateValuationResult(params);
      return {
        index,
        success: true,
        result,
      };
    } catch (error) {
      return {
        index,
        success: false,
        error: error.message,
      };
    }
  });

  sendResponse(res, 200, '批量估价完成', results);
});

// -------------------- 健康检查接口 --------------------

app.get('/api/mock/health', (req, res) => {
  sendResponse(res, 200, 'Mock服务器运行正常', {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: [
      '/api/estimate',
      '/api/estimate/fixed',
      '/api/estimate/timeout',
      '/api/estimate/validation-error',
      '/api/estimate/server-error',
      '/api/estimate/batch',
    ],
  });
});

// -------------------- 接口文档接口 --------------------

app.get('/api/mock/docs', (req, res) => {
  res.sendFile(__dirname + '/../docs/API接口规范.md');
});

// 404处理
app.use('*', (req, res) => {
  sendResponse(res, 404, '请求的Mock接口不存在');
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Mock服务器错误:', err.stack);
  sendResponse(res, 500, 'Mock服务器内部错误', null);
});

// 启动Mock服务器
app.listen(PORT, () => {
  console.log(`Mock服务器运行在 http://localhost:${PORT}`);
  console.log('可用接口:');
  console.log('  POST /api/estimate          - 正常估价接口');
  console.log('  POST /api/estimate/fixed    - 固定响应估价接口');
  console.log('  POST /api/estimate/timeout  - 超时模拟接口');
  console.log('  POST /api/estimate/validation-error - 参数验证错误模拟');
  console.log('  POST /api/estimate/server-error     - 服务器错误模拟');
  console.log('  POST /api/estimate/batch     - 批量估价接口');
  console.log('  GET  /api/mock/health        - 健康检查接口');
  console.log('  GET  /api/mock/docs          - 接口文档');
  console.log('\n特殊场景模拟接口:');
  console.log('  POST /api/estimate/invalid-format   - 响应格式异常');
  console.log('  POST /api/estimate/gateway-timeout  - 网关超时');
  console.log('  POST /api/estimate/unauthorized      - 未授权访问');
  console.log('  POST /api/estimate/forbidden         - 禁止访问');
  console.log('  POST /api/estimate/not-found         - 资源不存在');
});

// 处理退出信号
process.on('SIGINT', () => {
  console.log('\n正在关闭Mock服务器...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n正在关闭Mock服务器...');
  process.exit(0);
});
