# Mock接口系统开发计划

## 1. 需求分析

基于用户需求，我需要开发一个完整的Mock接口系统，支持：

- 前后端并行开发，消除对后端接口的依赖
- 隔离测试，排除外部环境干扰
- 特殊场景模拟，验证系统边界处理
- 提升开发效率，避免外部服务中断影响

## 2. 系统设计

### 2.1 技术架构

- **Mock服务器**：基于Express.js开发独立的Mock服务器
- **配置系统**：支持JSON配置的接口响应规则
- **前端集成**：提供统一的API调用封装，支持一键切换Mock/真实接口
- **监控系统**：记录Mock接口调用日志，便于调试

### 2.2 核心功能

#### 2.2.1 基础Mock功能

- 支持RESTful API模拟
- 可配置的响应数据和状态码
- 支持动态响应（基于请求参数生成响应）

#### 2.2.2 特殊场景模拟

- 接口超时模拟
- 参数验证错误模拟
- 返回数据格式异常模拟
- 服务器错误模拟

#### 2.2.3 接口规范管理

- 统一的接口规范文档生成
- 请求/响应格式验证
- 接口版本管理

#### 2.2.4 开发效率工具

- 一键切换Mock/真实接口
- 快速生成Mock数据
- 接口调用统计

## 3. 实施步骤

### 3.1 接口规范制定

- 分析现有估价算法接口
- 定义统一的接口路径：`/api/estimate`
- 明确请求参数格式（面积、户型、楼层等）
- 定义响应格式（估价结果、单价、报告ID等）

### 3.2 Mock服务器开发

1. **创建Mock服务器文件**：`server/mock-server.js`
2. **实现基础Mock接口**：
   ```javascript
   // 估价接口Mock实现
   app.post('/api/estimate', (req, res) => {
     const response = {
       price: 1250000,
       unitPrice: 8333,
       reportId: 'EST-12345',
     };
     res.json(response);
   });
   ```
3. **添加特殊场景模拟功能**：
   ```javascript
   // 超时模拟
   app.post('/api/estimate/timeout', (req, res) => {
     setTimeout(() => {
       res.json({
         /* 响应数据 */
       });
     }, 10000); // 10秒超时
   });
   ```

### 3.3 前端集成改造

1. **统一API调用封装**：修改`shared.js`，添加API调用管理

   ```javascript
   // API调用封装
   const API_CONFIG = {
     baseUrl: '/api',
     useMock: true,
   };

   async function callAPI(endpoint, options = {}) {
     const url = API_CONFIG.useMock
       ? '/mock-api' + endpoint
       : API_CONFIG.baseUrl + endpoint;
     // 实现API调用逻辑
   }
   ```

2. **添加一键切换功能**：在前端添加Mock/真实接口切换开关
3. **集成loading状态**：使用现有`showGlobalLoading()`和`hideGlobalLoading()`函数

### 3.4 测试工具开发

1. **创建接口异常模拟工具**：`tools/mock-simulator.js`
2. **支持多种异常场景**：
   - 超时模拟
   - 参数错误模拟
   - 服务器错误模拟
   - 数据格式异常模拟
3. **提供命令行接口**：支持一键启动特定异常场景

### 3.5 文档生成

1. **自动生成接口文档**：基于Mock配置生成API文档
2. **文档格式**：HTML格式，包含请求参数、响应格式、示例
3. **文档路径**：`docs/api-mock-docs.html`

## 4. 关键文件清单

### 4.1 后端文件

- `server/mock-server.js`：Mock服务器主文件
- `server/mock-config.json`：Mock接口配置
- `server/mock-middleware.js`：Mock中间件，支持异常模拟

### 4.2 前端文件

- `shared.js`：修改现有文件，添加API调用封装
- `mock-switcher.js`：Mock切换工具

### 4.3 工具文件

- `tools/mock-simulator.js`：异常场景模拟工具
- `tools/generate-docs.js`：接口文档生成工具

### 4.4 配置文件

- `mock-api-config.json`：全局Mock配置

## 5. 集成与测试

### 5.1 集成测试

- 前端调用Mock接口测试
- Mock/真实接口切换测试
- 异常场景模拟测试

### 5.2 性能测试

- Mock接口响应速度测试
- 并发请求处理能力测试

## 6. 交付标准

- ✅ 独立运行的Mock服务器
- ✅ 完整的API模拟，包括正常和异常场景
- ✅ 前端集成封装，支持一键切换
- ✅ 接口文档自动生成
- ✅ 异常场景模拟工具
- ✅ 测试用例和使用说明

## 7. 后续扩展

- 支持更多协议（WebSocket、GraphQL）
- 提供Web管理界面
- 支持动态更新Mock配置
- 集成CI/CD流程

## 8. 风险评估

- **风险**：Mock数据与真实数据格式不一致
  **对策**：严格按照接口规范生成Mock数据，定期同步真实接口格式

- **风险**：前端过度依赖Mock，与真实接口集成时出现问题
  **对策**：定期进行真实接口集成测试，确保Mock与真实接口行为一致

- **风险**：Mock服务器性能瓶颈
  **对策**：优化Mock服务器代码，使用缓存机制，限制并发连接数

该计划将确保我们能够实现用户需求，支持前后端并行开发，提高开发效率，并确保系统在各种场景下的稳定性。
