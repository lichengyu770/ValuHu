# ValuHub 部署环境规划文档

**版本**: v1.0  
**创建日期**: 2025年12月31日  
**负责人**: 「卫士」AI  
**文档类型**: 部署环境规划

---

## 📋 目录

1. [开发环境规划](#开发环境规划)
2. [Docker容器化配置](#docker容器化配置)
3. [CI/CD流程](#cicd流程)
4. [监控与日志](#监控与日志)
5. [安全配置](#安全配置)

---

## 开发环境规划

### 环境分层

#### 1. 本地开发环境（Local Dev）
- **用途**: 日常开发、单元测试
- **配置**: Docker Compose
- **数据**: 本地PostgreSQL + Redis
- **特点**: 快速启动、易于调试

#### 2. 测试环境（Staging）
- **用途**: 集成测试、用户验收
- **配置**: 云服务器 + Docker
- **数据**: 测试数据库（模拟数据）
- **特点**: 接近生产环境、定期重置

#### 3. 生产环境（Production）
- **用途**: 正式上线、用户访问
- **配置**: 云服务器 + Docker + Nginx
- **数据**: 生产数据库（真实数据）
- **特点**: 高可用、负载均衡、备份

### 环境变量配置

#### 开发环境 (.env.dev)
```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=valuhub_dev
DB_USER=valuhub
DB_PASSWORD=dev_password_123

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT配置
SECRET_KEY=dev_secret_key_change_in_production
JWT_SECRET_KEY=dev_jwt_secret_key
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440

# OSS配置
OSS_ACCESS_KEY=dev_access_key
OSS_SECRET_KEY=dev_secret_key
OSS_BUCKET=valuhub-dev-media
OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com

# 应用配置
APP_ENV=development
DEBUG=True
LOG_LEVEL=DEBUG
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

#### 测试环境 (.env.staging)
```bash
# 数据库配置
DB_HOST=staging-db.valuhub.com
DB_PORT=5432
DB_NAME=valuhub_staging
DB_USER=valuhub
DB_PASSWORD=${STAGING_DB_PASSWORD}

# Redis配置
REDIS_HOST=staging-redis.valuhub.com
REDIS_PORT=6379
REDIS_PASSWORD=${STAGING_REDIS_PASSWORD}
REDIS_DB=0

# JWT配置
SECRET_KEY=${STAGING_SECRET_KEY}
JWT_SECRET_KEY=${STAGING_JWT_SECRET_KEY}
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440

# OSS配置
OSS_ACCESS_KEY=${STAGING_OSS_ACCESS_KEY}
OSS_SECRET_KEY=${STAGING_OSS_SECRET_KEY}
OSS_BUCKET=valuhub-staging-media
OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com

# 应用配置
APP_ENV=staging
DEBUG=False
LOG_LEVEL=INFO
CORS_ORIGINS=https://staging.valuhub.com
```

#### 生产环境 (.env.production)
```bash
# 数据库配置
DB_HOST=prod-db.valuhub.com
DB_PORT=5432
DB_NAME=valuhub_prod
DB_USER=valuhub
DB_PASSWORD=${PROD_DB_PASSWORD}

# Redis配置
REDIS_HOST=prod-redis.valuhub.com
REDIS_PORT=6379
REDIS_PASSWORD=${PROD_REDIS_PASSWORD}
REDIS_DB=0

# JWT配置
SECRET_KEY=${PROD_SECRET_KEY}
JWT_SECRET_KEY=${PROD_JWT_SECRET_KEY}
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440

# OSS配置
OSS_ACCESS_KEY=${PROD_OSS_ACCESS_KEY}
OSS_SECRET_KEY=${PROD_OSS_SECRET_KEY}
OSS_BUCKET=valuhub-prod-media
OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com

# 应用配置
APP_ENV=production
DEBUG=False
LOG_LEVEL=WARNING
CORS_ORIGINS=https://www.valuhub.com,https://valuhub.com
```

---

## Docker容器化配置

### Dockerfile - Backend (FastAPI)

```dockerfile
# backend/Dockerfile

FROM python:3.10-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements.txt .

# 安装Python依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 创建非root用户
RUN useradd -m -u 1000 appuser && chown -R appuser /app
USER appuser

# 暴露端口
EXPOSE 8000

# 健康检查
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# 启动命令
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Dockerfile - Frontend (Taro)

```dockerfile
# frontend/Dockerfile

# 多阶段构建
FROM node:18-alpine AS builder

WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建应用
RUN npm run build:prod

# 生产镜像
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制nginx配置
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.yml - 开发环境

```yaml
version: '3.8'

services:
  # PostgreSQL数据库
  postgres:
    image: postgres:14-alpine
    container_name: valuhub-postgres-dev
    environment:
      POSTGRES_DB: valuhub_dev
      POSTGRES_USER: valuhub
      POSTGRES_PASSWORD: dev_password_123
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
      - ./backend/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    networks:
      - valuhub-dev-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U valuhub"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis缓存
  redis:
    image: redis:7-alpine
    container_name: valuhub-redis-dev
    command: redis-server --appendonly yes
    volumes:
      - redis_dev_data:/data
    ports:
      - "6379:6379"
    networks:
      - valuhub-dev-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # FastAPI后端
  backend:
    build: ./backend
    container_name: valuhub-backend-dev
    env_file:
      - .env.dev
    volumes:
      - ./backend:/app
      - media_dev:/app/media
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - valuhub-dev-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Taro前端
  frontend:
    build: ./frontend
    container_name: valuhub-frontend-dev
    environment:
      - NODE_ENV=development
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "5173:5173"
    depends_on:
      - backend
    networks:
      - valuhub-dev-network
    command: npm run dev

volumes:
  postgres_dev_data:
  redis_dev_data:
  media_dev:

networks:
  valuhub-dev-network:
    driver: bridge
```

### docker-compose.yml - 生产环境

```yaml
version: '3.8'

services:
  # PostgreSQL数据库
  postgres:
    image: postgres:14-alpine
    container_name: valuhub-postgres-prod
    environment:
      POSTGRES_DB: valuhub_prod
      POSTGRES_USER: valuhub
      POSTGRES_PASSWORD: ${PROD_DB_PASSWORD}
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
      - ./backups/postgres:/backups
    ports:
      - "5432:5432"
    networks:
      - valuhub-prod-network
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G

  # Redis缓存
  redis:
    image: redis:7-alpine
    container_name: valuhub-redis-prod
    command: redis-server --appendonly yes --requirepass ${PROD_REDIS_PASSWORD}
    volumes:
      - redis_prod_data:/data
    ports:
      - "6379:6379"
    networks:
      - valuhub-prod-network
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M

  # FastAPI后端
  backend:
    build: ./backend
    container_name: valuhub-backend-prod
    env_file:
      - .env.production
    volumes:
      - ./backend:/app
      - media_prod:/app/media
      - ./logs:/app/logs
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - valuhub-prod-network
    restart: unless-stopped
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
      update_config:
        parallelism: 1
        delay: 10s
        failure_action: rollback

  # Nginx反向代理
  nginx:
    image: nginx:alpine
    container_name: valuhub-nginx-prod
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./frontend/dist:/usr/share/nginx/html:ro
      - media_prod:/usr/share/nginx/media:ro
      - ./logs/nginx:/var/log/nginx
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    networks:
      - valuhub-prod-network
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M

volumes:
  postgres_prod_data:
  redis_prod_data:
  media_prod:

networks:
  valuhub-prod-network:
    driver: bridge
```

---

## CI/CD流程

### GitHub Actions配置

#### .github/workflows/ci-cd.yml

```yaml
name: ValuHub CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  # 测试任务
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: valuhub_test
          POSTGRES_USER: valuhub
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - name: Checkout代码
        uses: actions/checkout@v3
      
      - name: 设置Python环境
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'
          cache: 'pip'
      
      - name: 安装依赖
        run: |
          cd backend
          pip install -r requirements.txt
          pip install pytest pytest-cov
      
      - name: 运行单元测试
        run: |
          cd backend
          pytest tests/ --cov=app --cov-report=xml
      
      - name: 上传覆盖率报告
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage.xml
          flags: unittests
          name: codecov-umbrella

  # 构建任务
  build:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout代码
        uses: actions/checkout@v3
      
      - name: 设置Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: 登录Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: 构建并推送后端镜像
        uses: docker/build-push-action@v4
        with:
          context: ./backend
          push: true
          tags: valuhub/backend:${{ github.sha }},valuhub/backend:latest
      
      - name: 构建并推送前端镜像
        uses: docker/build-push-action@v4
        with:
          context: ./frontend
          push: true
          tags: valuhub/frontend:${{ github.sha }},valuhub/frontend:latest

  # 部署任务
  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout代码
        uses: actions/checkout@v3
      
      - name: 部署到生产环境
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/valuhub
            git pull origin main
            docker-compose pull
            docker-compose up -d
            docker system prune -f
```

---

## 监控与日志

### Prometheus配置

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'valuhub'
    static_configs:
      - targets: ['backend:8000', 'nginx:80']
    metrics_path: '/metrics'
```

### Grafana仪表板配置

```json
{
  "dashboard": {
    "title": "ValuHub监控仪表板",
    "panels": [
      {
        "title": "API响应时间",
        "targets": [
          {
            "expr": "histogram_quantile(api_request_duration_seconds, 0.95)"
          }
        ]
      },
      {
        "title": "数据库连接数",
        "targets": [
          {
            "expr": "pg_stat_activity_count"
          }
        ]
      },
      {
        "title": "Redis命中率",
        "targets": [
          {
            "expr": "redis_keyspace_hits / (redis_keyspace_hits + redis_keyspace_misses)"
          }
        ]
      }
    ]
  }
}
```

### 日志配置

```python
# backend/app/logging.py

import logging
import sys
from pythonjsonlogger import logger

# 日志格式
log_format = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# 控制台日志
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setFormatter(log_format)

# 文件日志
file_handler = logging.FileHandler('logs/app.log')
file_handler.setFormatter(log_format)

# 日志级别
logger.setLevel(logging.DEBUG)
console_handler.setLevel(logging.DEBUG)
file_handler.setLevel(logging.INFO)

logger.addHandler(console_handler)
logger.addHandler(file_handler)
```

---

## 安全配置

### Nginx安全配置

```nginx
# nginx/nginx.conf

server {
    listen 443 ssl http2;
    server_name www.valuhub.com valuhub.com;
    
    # SSL证书
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';";
    
    # 限流
    limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;
    limit_req zone=one burst=20 nodelay;
    
    # 代理配置
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
        
        # 缓存配置
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
    
    # 静态资源
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
        root /usr/share/nginx/html;
        expires 30d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
}
```

### 数据库安全配置

```sql
-- 安全配置
-- 1. 最小权限原则
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO valuhub_app;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO valuhub_app;

-- 2. 连接限制
ALTER DATABASE valuhub_prod SET connection_limit = 100;

-- 3. 查询超时
ALTER DATABASE valuhub_prod SET statement_timeout = '30s';

-- 4. 日志记录
ALTER DATABASE valuhub_prod SET log_statement = 'all';
```

---

## 备份策略

### 数据库备份

```bash
#!/bin/bash
# scripts/backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgres"
DB_NAME="valuhub_prod"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 执行备份
docker exec valuhub-postgres-prod pg_dump -U valuhub $DB_NAME | gzip > $BACKUP_DIR/valuhub_$DATE.sql.gz

# 保留最近7天的备份
find $BACKUP_DIR -name "valuhub_*.sql.gz" -mtime +7 -delete

echo "Backup completed: valuhub_$DATE.sql.gz"
```

### 媒体文件备份

```bash
#!/bin/bash
# scripts/backup-media.sh

DATE=$(date +%Y%m%d_%H%M%S)
SOURCE_DIR="/app/media"
BACKUP_DIR="/backups/media"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 执行备份
tar -czf $BACKUP_DIR/media_$DATE.tar.gz $SOURCE_DIR

# 上传到OSS
ossutil cp $BACKUP_DIR/media_$DATE.tar.gz oss://valuhub-backups/media/

# 保留最近30天的备份
find $BACKUP_DIR -name "media_*.tar.gz" -mtime +30 -delete

echo "Media backup completed: media_$DATE.tar.gz"
```

---

## 快速启动指南

### 本地开发环境启动

```bash
# 1. 克隆代码
git clone https://github.com/your-org/valuhub.git
cd valuhub

# 2. 配置环境变量
cp .env.dev.example .env.dev

# 3. 启动服务
docker-compose up -d

# 4. 查看日志
docker-compose logs -f

# 5. 停止服务
docker-compose down
```

### 生产环境部署

```bash
# 1. 准备环境变量
scp .env.production user@server:/opt/valuhub/.env.production

# 2. 拉取最新代码
ssh user@server "cd /opt/valuhub && git pull origin main"

# 3. 构建镜像
docker-compose -f docker-compose.prod.yml build

# 4. 启动服务
docker-compose -f docker-compose.prod.yml up -d

# 5. 检查服务状态
docker-compose -f docker-compose.prod.yml ps

# 6. 查看日志
docker-compose -f docker-compose.prod.yml logs -f backend
```

---

## 故障排查

### 常见问题

#### 1. 容器无法启动
```bash
# 查看容器日志
docker-compose logs backend

# 检查容器状态
docker-compose ps

# 进入容器调试
docker-compose exec backend bash
```

#### 2. 数据库连接失败
```bash
# 检查数据库是否健康
docker-compose exec postgres pg_isready -U valuhub

# 查看数据库日志
docker-compose logs postgres

# 测试数据库连接
docker-compose exec backend python -c "from app.database import engine; engine.connect()"
```

#### 3. API无法访问
```bash
# 检查nginx配置
docker-compose exec nginx nginx -t

# 查看nginx日志
docker-compose logs nginx

# 测试后端服务
curl http://localhost:8000/health
```

---

## 下一步

1. 开始第二步：并行模块开发
2. 后端API开发（「引擎」AI）
3. 前端多端开发（「界面」AI）
4. 估价算法开发（「大脑」AI）
5. 持续测试（「卫士」AI）

---

**文档状态**: ✅ 已完成  
**下一步**: 第二步：并行模块开发
