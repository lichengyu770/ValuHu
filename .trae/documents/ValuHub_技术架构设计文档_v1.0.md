# ValuHub 技术架构设计文档

**版本**: v1.0  
**创建日期**: 2025年12月31日  
**负责人**: 「引擎」AI  
**文档类型**: 技术选型与架构设计

---

## 📋 目录

1. [技术选型](#技术选型)
2. [系统架构](#系统架构)
3. [数据库设计](#数据库设计)
4. [API设计](#api设计)
5. [部署架构](#部署架构)

---

## 技术选型

### 前端技术栈

#### 核心框架
- **多端框架**: Taro 3.x (React)
  - 支持小程序、H5、React Native
  - 统一代码库，一次开发多端运行
  - 丰富的组件生态（Taro UI）

#### 状态管理
- **状态管理**: Redux Toolkit + React Query
  - Redux Toolkit: 全局状态管理
  - React Query: 服务端状态管理和缓存

#### UI组件库
- **组件库**: Taro UI + Ant Design Mobile
  - Taro UI: 基础组件库
  - Ant Design Mobile: 移动端组件

#### 构建工具
- **构建工具**: Webpack 5 + Vite
  - Webpack: 生产环境打包
  - Vite: 开发环境快速构建

---

### 后端技术栈

#### 核心框架
- **主框架**: FastAPI (Python 3.10+)
  - 高性能异步框架
  - 自动生成OpenAPI文档
  - 类型安全（Pydantic）

#### 辅助服务
- **辅助框架**: Node.js + Express
  - 现有Node.js服务保留
  - 用于特定业务逻辑
  - 与FastAPI协同工作

#### 数据库
- **主数据库**: PostgreSQL 14+
  - ACID事务支持
  - 复杂查询能力
  - JSON字段支持

- **缓存**: Redis 7+
  - 高性能键值存储
  - 会话管理
  - API响应缓存

#### 消息队列
- **消息队列**: RabbitMQ / Redis Pub/Sub
  - 异步任务处理
  - 事件驱动架构
  - 系统解耦

---

### AI/算法技术栈

#### 机器学习
- **ML框架**: Scikit-learn + TensorFlow
  - Scikit-learn: 传统ML算法
  - TensorFlow: 深度学习模型

#### 数据处理
- **数据处理**: Pandas + NumPy
  - Pandas: 数据清洗和分析
  - NumPy: 数值计算

#### 可视化
- **可视化**: Matplotlib + ECharts
  - Matplotlib: 数据图表生成
  - ECharts: 前端数据可视化

---

### 基础设施

#### 容器化
- **容器**: Docker + Docker Compose
  - 统一开发环境
  - 一键部署
  - 环境隔离

#### 反向代理
- **代理**: Nginx
  - 负载均衡
  - 静态资源服务
  - SSL/TLS终结

#### 监控
- **监控**: Prometheus + Grafana
  - 系统性能监控
  - 日志聚合
  - 告警通知

---

## 系统架构

### 架构模式
**采用微服务架构**，理由：
- 独立部署和扩展
- 技术栈灵活
- 故障隔离
- 团队并行开发

### 架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                      客户端层                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  │
│  │ 个人端  │  │ 政务端  │  │ 企业端  │  │ 院校端  │  │
│  │ (Taro)  │  │ (Taro)  │  │ (Taro)  │  │ (Taro)  │  │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  │
└───────┼────────────┼────────────┼────────────┼────────────┼──┘
        │            │            │            │            │
        └────────────┴────────────┴────────────┴────────────┐
                       │                                 │
┌──────────────────────┼─────────────────────────────────────────┤
│              Nginx (反向代理 + 负载均衡)              │
└──────────────────────┼─────────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
┌───────┼──────────────────────────────┼─────────┐
│       │       API网关层              │         │
│  ┌────┴────┐                   │         │
│  │ FastAPI  │                   │         │
│  │ (主服务)  │                   │         │
│  └────┬────┘                   │         │
└───────┼───────────────────────────┼─────────┘
        │                           │
┌───────┼───────────┬───────────────┼─────────┐
│       │           │               │         │
│  ┌────┴────┐  ┌────┴────┐  ┌────┴────┐│
│  │ 用户服务  │  │ 房产服务  │  │ 估价服务  ││
│  └────┬────┘  └────┬────┘  └────┬────┘│
└───────┼────────────┼────────────┼──────────┼──┘
        │            │            │            │
┌───────┼────────────┼────────────┼────────────┐
│       │            │            │            │
│  ┌────┴────┐  ┌────┴────┐  ┌────┴────┐│
│  │PostgreSQL│  │  Redis   │  │RabbitMQ  ││
│  └─────────┘  └──────────┘  └──────────┘│
└───────────────────────────────────────────────────┘
```

### 服务划分

#### 1. API网关层
- **职责**: 统一入口、路由分发、认证授权
- **技术**: FastAPI + JWT
- **功能**:
  - 请求路由
  - 身份认证
  - 权限校验
  - 限流控制

#### 2. 用户服务
- **职责**: 用户管理、认证授权、权限控制
- **技术**: FastAPI + PostgreSQL
- **功能**:
  - 用户注册/登录
  - 角色权限管理
  - 用户信息管理
  - 会话管理

#### 3. 房产服务
- **职责**: 房产CRUD、搜索筛选、数据同步
- **技术**: FastAPI + PostgreSQL + Redis
- **功能**:
  - 房产信息管理
  - 搜索和筛选
  - 数据缓存
  - 批量导入/导出

#### 4. 估价服务
- **职责**: AI估价、历史记录、报告生成
- **技术**: FastAPI + Scikit-learn + Celery
- **功能**:
  - AI估价计算
  - 估价历史管理
  - 报告生成
  - 异步任务处理

#### 5. 报告服务
- **职责**: 报告模板、PDF生成、文件存储
- **技术**: FastAPI + WeasyPrint + OSS
- **功能**:
  - 报告模板管理
  - PDF生成
  - 文件存储
  - 下载链接生成

---

## 数据库设计

### 核心表结构

#### 1. 用户表 (users)
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,  -- 'individual', 'government', 'enterprise', 'academic', 'developer'
    phone VARCHAR(20),
    avatar_url VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active',  -- 'active', 'inactive', 'suspended'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
```

#### 2. 房产表 (properties)
```sql
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    address VARCHAR(255) NOT NULL,
    city VARCHAR(50) NOT NULL,
    district VARCHAR(50),
    area DECIMAL(10, 2) NOT NULL,  -- 建筑面积
    floor_level INTEGER,
    building_year INTEGER,
    property_type VARCHAR(50),  -- 'residential', 'commercial', 'industrial'
    rooms INTEGER,
    bathrooms INTEGER,
    orientation VARCHAR(20),
    decoration_status VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_properties_user ON properties(user_id);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_district ON properties(district);
CREATE INDEX idx_properties_status ON properties(status);
```

#### 3. 估价记录表 (valuations)
```sql
CREATE TABLE valuations (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id),
    user_id INTEGER REFERENCES users(id),
    estimated_price DECIMAL(15, 2) NOT NULL,
    price_per_sqm DECIMAL(10, 2),
    confidence_level DECIMAL(5, 2),  -- 0.00-1.00
    model_version VARCHAR(50),
    features JSONB,  -- 估价特征
    result_details JSONB,  -- 详细结果
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_valuations_property ON valuations(property_id);
CREATE INDEX idx_valuations_user ON valuations(user_id);
CREATE INDEX idx_valuations_created ON valuations(created_at DESC);
```

#### 4. 报告表 (reports)
```sql
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    valuation_id INTEGER REFERENCES valuations(id),
    user_id INTEGER REFERENCES users(id),
    template_id INTEGER,
    file_url VARCHAR(255),
    file_name VARCHAR(255),
    file_size INTEGER,
    status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'generating', 'completed', 'failed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_reports_valuation ON reports(valuation_id);
CREATE INDEX idx_reports_user ON reports(user_id);
CREATE INDEX idx_reports_status ON reports(status);
```

#### 5. 报告模板表 (report_templates)
```sql
CREATE TABLE report_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    template_type VARCHAR(50),  -- 'standard', 'detailed', 'government', 'enterprise'
    template_content JSONB,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## API设计

### RESTful API列表

#### 用户模块
```
POST   /api/v1/auth/register       # 用户注册
POST   /api/v1/auth/login          # 用户登录
POST   /api/v1/auth/logout         # 用户登出
GET    /api/v1/users/profile        # 获取用户信息
PUT    /api/v1/users/profile        # 更新用户信息
GET    /api/v1/users/{id}          # 获取用户详情
```

#### 房产模块
```
POST   /api/v1/properties          # 创建房产
GET    /api/v1/properties          # 获取房产列表
GET    /api/v1/properties/{id}     # 获取房产详情
PUT    /api/v1/properties/{id}     # 更新房产信息
DELETE /api/v1/properties/{id}     # 删除房产
GET    /api/v1/properties/search   # 搜索房产
POST   /api/v1/properties/batch    # 批量导入房产
```

#### 估价模块
```
POST   /api/v1/valuations         # 创建估价
GET    /api/v1/valuations         # 获取估价列表
GET    /api/v1/valuations/{id}    # 获取估价详情
GET    /api/v1/valuations/property/{property_id}  # 获取房产估价历史
POST   /api/v1/valuations/batch   # 批量估价
GET    /api/v1/valuations/market-trend  # 市场趋势分析
```

#### 报告模块
```
POST   /api/v1/reports            # 生成报告
GET    /api/v1/reports            # 获取报告列表
GET    /api/v1/reports/{id}       # 获取报告详情
GET    /api/v1/reports/download/{id}  # 下载报告
GET    /api/v1/report-templates   # 获取报告模板
```

### API响应格式

#### 成功响应
```json
{
  "code": 200,
  "message": "success",
  "data": {
    // 业务数据
  },
  "timestamp": "2025-12-31T00:00:00Z"
}
```

#### 错误响应
```json
{
  "code": 400,
  "message": "参数错误",
  "errors": [
    {
      "field": "email",
      "message": "邮箱格式不正确"
    }
  ],
  "timestamp": "2025-12-31T00:00:00Z"
}
```

---

## 部署架构

### Docker Compose配置

```yaml
version: '3.8'

services:
  # PostgreSQL数据库
  postgres:
    image: postgres:14-alpine
    container_name: valuhub-postgres
    environment:
      POSTGRES_DB: valuhub
      POSTGRES_USER: valuhub
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - valuhub-network

  # Redis缓存
  redis:
    image: redis:7-alpine
    container_name: valuhub-redis
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - valuhub-network

  # FastAPI后端
  backend:
    build: ./backend
    container_name: valuhub-backend
    environment:
      DATABASE_URL: postgresql://valuhub:${DB_PASSWORD}@postgres:5432/valuhub
      REDIS_URL: redis://redis:6379/0
      SECRET_KEY: ${SECRET_KEY}
    volumes:
      - ./backend:/app
      - media_files:/app/media
    ports:
      - "8000:8000"
    depends_on:
      - postgres
      - redis
    networks:
      - valuhub-network

  # Nginx反向代理
  nginx:
    image: nginx:alpine
    container_name: valuhub-nginx
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./frontend/dist:/usr/share/nginx/html:ro
      - media_files:/usr/share/nginx/media:ro
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    networks:
      - valuhub-network

volumes:
  postgres_data:
  redis_data:
  media_files:

networks:
  valuhub-network:
    driver: bridge
```

### 环境变量配置

```bash
# .env
DB_PASSWORD=your_secure_password
SECRET_KEY=your_secret_key_here
JWT_SECRET_KEY=your_jwt_secret_key
OSS_ACCESS_KEY=your_oss_access_key
OSS_SECRET_KEY=your_oss_secret_key
OSS_BUCKET=valuhub-media
```

---

## 技术选型理由

### 为什么选择Taro？
- ✅ 一次开发，多端运行（小程序、H5、React Native）
- ✅ React生态，学习成本低
- ✅ 丰富的组件库和工具
- ✅ 活跃的社区支持

### 为什么选择FastAPI？
- ✅ 高性能异步框架
- ✅ 自动生成OpenAPI文档
- ✅ 类型安全（Pydantic）
- ✅ 现代Python特性（async/await）

### 为什么选择PostgreSQL？
- ✅ ACID事务支持
- ✅ 复杂查询能力
- ✅ JSON字段支持
- ✅ 开源免费
- ✅ 成熟稳定

### 为什么选择Redis？
- ✅ 高性能键值存储
- ✅ 丰富的数据结构
- ✅ 持久化和集群支持
- ✅ 简单易用

---

## 下一步

1. 完成数据库Schema详细设计
2. 开始API接口开发
3. 准备前端开发环境

---

**文档状态**: ✅ 已完成  
**下一步**: 部署环境规划（「卫士」AI）
