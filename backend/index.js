const express = require('express');
const cors = require('cors');
const { query, pool } = require('./config/db');
const routes = require('./routes');
const { swaggerUi, specs } = require('./config/swagger');
const path = require('path');
const multiTenantMiddleware = require('./middleware/multiTenant');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 添加多租户中间件
app.use(multiTenantMiddleware);

// 静态文件服务
app.use('/reports', express.static(path.join(__dirname, 'reports')));

// API路由
app.use('/api', routes);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', message: '服务器运行正常，数据库已连接' });
  } catch (error) {
    res.json({ status: 'ok', message: '服务器运行正常，数据库未连接' });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: 'API路由未找到' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '服务器内部错误' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`API文档可访问: http://localhost:${PORT}/api-docs`);
  console.log(`健康检查: http://localhost:${PORT}/health`);
});

module.exports = app;