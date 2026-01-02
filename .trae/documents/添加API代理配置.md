## 项目结构优化实施计划

### 1. 后端结构优化

#### 1.1 新增 routes/ 目录

* 创建 `routes/estimate.routes.js` - 估价接口路由

* 创建 `routes/house.routes.js` - 房源接口路由

* 创建 `routes/user.routes.js` - 用户接口路由

* 创建 `routes/file.routes.js` - 文件上传接口路由

* 创建 `routes/map.routes.js` - 地图辅助接口路由

* 将 server.js 中的路由逻辑拆分到对应文件

#### 1.2 新增 controllers/ 目录

* 创建 `controllers/EstimateController.js` - 估价业务逻辑

* 创建 `controllers/HouseController.js` - 房源业务逻辑

* 创建 `controllers/UserController.js` - 用户业务逻辑

* 创建 `controllers/FileController.js` - 文件上传业务逻辑

* 创建 `controllers/MapController.js` - 地图辅助业务逻辑

* 将路由处理函数迁移到对应控制器

#### 1.3 新增 middlewares/ 目录

* 创建 `middlewares/auth.js` - 权限验证中间件

* 创建 `middlewares/errorHandler.js` - 异常处理中间件

* 创建 `middlewares/requestLogger.js` - 请求日志中间件

* 创建 `middlewares/rateLimiter.js` - 请求限流中间件

#### 1.4 新增 utils/ 目录

* 创建 `utils/db.js` - 数据库操作封装

* 创建 `utils/response.js` - 统一响应格式化工具

* 创建 `utils/validator.js` - 数据验证工具

* 创建 `utils/cache.js` - 缓存工具

#### 1.5 添加环境变量管理

* 创建 `.env` 文件，管理接口地址、高德地图key等环境变量

* 使用 dotenv 库加载环境变量

### 2. 前端结构补充

#### 2.1 拆分 services/ 目录

* 创建 `services/estimateService.ts` - 估价服务

* 创建 `services/mapService.ts` - 地图服务

* 创建 `services/houseService.ts` - 房源服务

* 创建 `services/userService.ts` - 用户服务

* 创建 `services/fileService.ts` - 文件上传服务

#### 2.2 新增 hooks/ 目录

* 创建 `hooks/useMap.js` - 地图加载和管理Hook

* 创建 `hooks/useApiRequest.js` - 数据请求Hook

* 创建 `hooks/useEstimate.js` - 估价逻辑Hook

* 创建 `hooks/useDebounce.js` - 防抖Hook

#### 2.3 优化 assets/ 目录

* 整理现有的静态资源到 assets/ 目录

* 按类型分类管理（images/、styles/等）

#### 2.4 添加环境变量管理

* 创建 `.env` 文件，管理接口地址、高德地图key等环境变量

* 在 Vite 配置中使用环境变量

### 3. 数字估价系统优化

#### 3.1 地图服务优化

* 结合高德地图API，实现地址与经纬度的转换

* 优化地图组件，提升用户体验

#### 3.2 性能优化

* 前端对高频请求做缓存

* 后端对估价结果做Redis缓存

* 实现估价结果的缓存机制

#### 3.3 数据存储优化

* 设计支持MySQL迁移的数据库结构

* 实现数据备份机制

### 4. 实施步骤

1. 优化后端结构

   * 创建目录结构

   * 拆分路由和控制器

   * 添加中间件

   * 封装工具函数

   * 配置环境变量

2. 优化前端结构

   * 拆分服务

   * 封装自定义Hooks

   * 整理静态资源

   * 配置环境变量

3. 优化数字估价系统功能

   * 优化地图服务

   * 添加缓存机制

   * 优化数据存储

4. 测试和验证

   * 测试所有接口功能

   * 测试前端页面功能

   * 验证性能优化效果

### 5. 技术要点

* 保持代码的模块化和可维护性

* 遵循RESTful API设计原则

* 实现统一的错误处理和响应格式

* 使用环境变量管理配置

* 优化性能和用户体验

* 确保代码质量和安全性

