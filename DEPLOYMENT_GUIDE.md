# ValuHub平台部署指南

本指南将帮助您将ValuHub平台部署到生产环境。

## 1. 环境准备

### 1.1 系统要求
- Node.js 18.x 或更高版本
- PostgreSQL 14.x 或更高版本
- Git

### 1.2 安装依赖

```bash
# 克隆仓库
git clone <repository-url>
cd test-routes

# 安装后端依赖
cd backend
npm install
```

## 2. 配置文件

### 2.1 环境变量配置

复制 `.env` 文件并根据您的环境修改配置：

```bash
cp .env .env.production
```

编辑 `.env.production` 文件，配置以下项：

```env
# PostgreSQL数据库配置
DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<database>

# JWT配置
JWT_SECRET=your_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# 服务器配置
PORT=3000

# 环境配置
NODE_ENV=production
```

## 3. 数据库设置

### 3.1 初始化数据库

确保PostgreSQL数据库已经创建，然后运行数据库迁移（如果有）。

## 4. 启动服务

### 4.1 开发环境

```bash
npm run dev
```

### 4.2 生产环境

```bash
npm start
```

### 4.3 使用PM2管理进程

```bash
# 安装PM2
npm install -g pm2

# 启动服务
pm run build
pm run start

# 或使用PM2直接启动
pm run build
pm run start
```

## 5. 前端部署

### 5.1 静态文件服务

前端HTML文件位于项目根目录，您可以使用Nginx或其他Web服务器来部署前端文件。

### 5.2 Nginx配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    root /path/to/test-routes;
    index index.html;

    # 后端API代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # PDF报告静态文件
    location /reports {
        proxy_pass http://localhost:3000;
    }

    # 其他配置...
}
```

## 6. SSL配置

建议使用Let's Encrypt为您的域名配置SSL证书：

```bash
# 安装Certbot
apt install certbot python3-certbot-nginx

# 配置SSL
certbot --nginx -d your-domain.com
```

## 7. 监控与维护

### 7.1 日志管理

使用PM2或其他进程管理工具收集日志：

```bash
# 查看PM2日志
pm run logs

# 或
pm run logs <app-name>
```

### 7.2 定期备份

定期备份数据库和重要文件：

```bash
# 备份PostgreSQL数据库
pg_dump -U <username> <database> > backup_$(date +%Y-%m-%d).sql

# 备份生成的报告
zip -r reports_backup_$(date +%Y-%m-%d).zip /path/to/test-routes/backend/reports
```

## 8. 常见问题

### 8.1 端口占用

如果端口3000被占用，您可以修改 `.env` 文件中的 `PORT` 配置项。

### 8.2 数据库连接问题

确保：
- 数据库服务正在运行
- 数据库用户名和密码正确
- 数据库主机和端口正确
- 防火墙允许连接

### 8.3 JWT密钥问题

确保 `JWT_SECRET` 配置项使用强密码，建议使用随机生成的字符串。

## 9. 升级指南

### 9.1 拉取最新代码

```bash
git pull
```

### 9.2 更新依赖

```bash
npm install
```

### 9.3 重启服务

```bash
pm run restart
```

## 10. 安全建议

- 使用HTTPS协议
- 定期更新依赖
- 配置适当的防火墙规则
- 定期备份数据
- 使用强密码
- 限制数据库用户权限

## 11. 联系方式

如果您在部署过程中遇到问题，请联系技术支持。