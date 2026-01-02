# ValuHub 后端应用
FastAPI + PostgreSQL + Redis

## 快速开始

### 开发环境启动
```bash
# 1. 创建虚拟环境
python -m venv venv

# 2. 激活虚拟环境
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate  # Windows

# 3. 安装依赖
pip install -r requirements.txt

# 4. 初始化数据库
python -c "from app.database.database import init_db; init_db()"

# 5. 启动开发服务器
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### API文档访问
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- 健康检查: http://localhost:8000/health

### 环境变量
创建 `.env` 文件并配置以下变量：
- DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
- REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
- SECRET_KEY, JWT_SECRET_KEY, JWT_ALGORITHM
- OSS_ACCESS_KEY, OSS_SECRET_KEY, OSS_BUCKET, OSS_ENDPOINT
- APP_ENV (development/staging/production)
- CORS_ORIGINS
- LOG_LEVEL

## 项目结构
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # 主应用
│   ├── core/
│   │   └── config.py       # 配置管理
│   ├── database/
│   │   └── database.py    # 数据库连接
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py         # 用户模型
│   │   ├── property.py     # 房产模型
│   │   ├── valuation.py    # 估价模型
│   │   └── report.py       # 报告模型
│   ├── api/
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── auth.py       # 认证路由
│   │   │   ├── property.py   # 房产路由
│   │   │   ├── valuation.py # 估价路由
│   │   │   ├── report.py     # 报告路由
│   │   │   └── data.py       # 数据路由
│   └── schemas/
│       ├── auth.py         # 认证Schema
│       ├── property.py     # 房产Schema
│       ├── valuation.py    # 估价Schema
│       ├── report.py       # 报告Schema
│       └── data.py         # 数据Schema
├── requirements.txt            # Python依赖
├── .env.example              # 环境变量示例
├── .gitignore                # Git忽略文件
└── README.md                # 项目说明
```

## API端点

### 认证模块 (`/api/v1/auth`)
- `POST /register` - 用户注册
- `POST /login` - 用户登录
- `POST /logout` - 用户登出
- `GET /profile` - 获取用户信息
- `PUT /profile` - 更新用户信息

### 房产模块 (`/api/v1/properties`)
- `POST /` - 创建房产
- `GET /` - 获取房产列表
- `GET /{id}` - 获取房产详情
- `PUT /{id}` - 更新房产信息
- `DELETE /{id}` - 删除房产
- `GET /search` - 搜索房产
- `POST /batch` - 批量导入房产

### 估价模块 (`/api/v1/valuations`)
- `POST /` - 创建估价
- `GET /` - 获取估价列表
- `GET /{id}` - 获取估价详情
- `GET /property/{id}` - 获取房产估价历史
- `POST /batch` - 批量估价
- `GET /market-trend` - 市场趋势分析

### 报告模块 (`/api/v1/reports`)
- `POST /` - 生成报告
- `GET /` - 获取报告列表
- `GET /{id}` - 获取报告详情
- `GET /download/{id}` - 下载报告
- `GET /templates` - 获取报告模板
- `POST /templates` - 创建报告模板

### 数据模块 (`/api/v1/data`)
- `GET /area-statistics` - 区域统计
- `POST /export` - 数据导出

## 数据库模型

### User (用户表)
- id, username, email, password_hash, role, phone, avatar_url, status, created_at, updated_at, last_login_at

### Property (房产表)
- id, user_id, address, city, district, area, floor_level, building_year, property_type, rooms, bathrooms, orientation, decoration_status, latitude, longitude, status, created_at, updated_at

### Valuation (估价记录表)
- id, property_id, user_id, estimated_price, price_per_sqm, confidence_level, model_version, features, result_details, created_at

### Report (报告表)
- id, valuation_id, user_id, template_id, file_url, file_name, file_size, status, created_at, completed_at

### ReportTemplate (报告模板表)
- id, name, description, template_type, template_content, is_default, created_at, updated_at

## 技术特性

- ✅ FastAPI异步框架
- ✅ 自动生成OpenAPI文档
- ✅ Pydantic数据验证
- ✅ SQLAlchemy ORM
- ✅ JWT认证
- ✅ PostgreSQL数据库
- ✅ Redis缓存
- ✅ CORS支持
- ✅ 日志中间件

## 开发计划

### 第2-4天：核心API开发
- [x] 用户模块完成
- [x] 房产模块完成
- [ ] 估价模块完成（需要AI模型集成）
- [ ] 报告模块完成（需要PDF生成服务）
- [ ] 数据模块完成

### 第11-12天：前后端联调
- [ ] API文档生成
- [ ] 前端对接调整
- [ ] 测试与修复

## 注意事项

1. **环境变量**: 所有敏感信息使用环境变量，不要硬编码
2. **密码安全**: 使用bcrypt加密密码，不要明文存储
3. **SQL注入**: 使用SQLAlchemy ORM，避免原生SQL
4. **CORS**: 正确配置CORS，允许前端访问
5. **日志**: 记录重要操作和错误信息
6. **测试**: 编写单元测试和集成测试
