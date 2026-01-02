import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

// 加载环境变量
import dotenv from 'dotenv';
dotenv.config({
  path: path.join(new URL('.', import.meta.url).pathname, '../.env')
});

import db from './db.js';

// 导入路由模块
import estimateRoutes from './routes/estimate.routes.js';
import houseRoutes from './routes/house.routes.js';
import userRoutes from './routes/user.routes.js';
import fileRoutes from './routes/file.routes.js';
import mapRoutes from './routes/map.routes.js';

// 导入中间件
import { productionLogger } from './middlewares/requestLogger.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { authenticate, authorizeAdmin, authorizeRole, authorizePermission } from './middlewares/auth.js';
import { rateLimiter, authRateLimiter, apiRateLimiter } from './middlewares/rateLimiter.js';

const app = express();

// 允许跨域
app.use(cors());

// 解析JSON请求
app.use(express.json());

// 提供静态文件服务
app.use(express.static(path.join(__dirname, '..')));

// 使用中间件
app.use(productionLogger);
app.use(rateLimiter.rateLimiter());

// API状态检查
app.get('/api/status', (req, res) => {
  res.send({ success: true, message: '后端服务运行正常' });
});

// 使用路由模块
app.use('/api', userRoutes);
app.use('/api', houseRoutes);
app.use('/api', estimateRoutes);
app.use('/api', fileRoutes);
app.use('/api', mapRoutes);

// 使用错误处理中间件
app.use(notFoundHandler);
app.use(errorHandler);

// 启动服务
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`后端服务启动：http://localhost:${PORT}`);
  console.log(`API状态检查：http://localhost:${PORT}/api/status`);
  console.log(`登录接口：http://localhost:${PORT}/api/login`);
  console.log(`房源列表接口：http://localhost:${PORT}/api/properties`);
  console.log(`小区列表接口：http://localhost:${PORT}/api/districts`);
  console.log(`房产估价接口：http://localhost:${PORT}/api/valuation`);
  console.log(`估价报告接口：http://localhost:${PORT}/api/reports`);
  console.log(`文件上传接口：http://localhost:${PORT}/api/upload`);
  console.log(`地图辅助接口：http://localhost:${PORT}/api/map`);
});
