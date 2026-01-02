const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

// 路由导入
const propertyRoutes = require('./routes/propertyRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const workorderRoutes = require('./routes/workorderRoutes');
const valuationRoutes = require('./routes/valuationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger API文档
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 路由配置
app.use('/api/properties', propertyRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/workorders', workorderRoutes);
app.use('/api/valuation', valuationRoutes);
app.use('/api/analytics', analyticsRoutes);

// 数据库连接
mongoose
  .connect(
    process.env.MONGODB_URI || 'mongodb://localhost:27017/valuation-engine',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log('MongoDB连接成功');
  })
  .catch((err) => {
    console.error('MongoDB连接失败:', err);
    process.exit(1);
  });

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'valuation-engine-api',
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: 'API not found',
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    code: 500,
    message: 'Internal Server Error',
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`API文档地址: http://localhost:${PORT}/api-docs`);
});

module.exports = app;
