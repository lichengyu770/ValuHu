# 数智估价核心引擎 - 扩展功能说明

## 功能概述

本扩展通过外部文件和配套服务实现了对核心系统的功能增强，无需修改原始`index.html`文件。主要包含以下功能模块：

### 1. 前端增强功能

- **PDF导出功能**：支持将评估报告导出为PDF格式
- **区域房价对比图表**：使用ECharts实现房价数据可视化
- **团队成员动态加载**：从`data/team.json`加载最新团队信息
- **登录功能对接**：与后端API集成的用户认证系统

### 2. 后端服务

- **登录API**：提供用户身份验证功能
- **状态检查接口**：监控服务运行状态

## 项目结构

```
test-routes/
├── data/
│   └── team.json         # 团队成员数据
├── server/
│   ├── server.js         # Node.js后端服务
│   ├── user.json         # 测试用户数据
│   ├── package.json      # 后端项目配置
│   └── Dockerfile        # Docker构建文件
├── extend.js             # 前端功能扩展脚本
├── docker-compose.yml    # 容器编排配置
└── README-EXTENSION.md   # 本说明文档
```

## 使用指南

### 方式一：直接使用

1. **启动后端服务**：

   ```bash
   cd server
   npm install
   npm start
   ```

2. **访问前端页面**：
   直接在浏览器中打开`index.html`文件即可使用扩展功能。

### 方式二：Docker部署

1. **构建并启动容器**：

   ```bash
   docker-compose up -d
   ```

2. **访问服务**：
   - 前端：http://localhost
   - 后端API：http://localhost:3000/api/status

## 测试账号

用于登录测试的账号信息：

- **普通用户**：
  - 用户名：testuser
  - 密码：test123

- **管理员**：
  - 用户名：admin
  - 密码：admin123

## 后端API接口

### 1. 用户登录

**请求**：

- URL: `/api/login`
- 方法: POST
- 参数: `{"username": "用户名", "password": "密码"}`

**响应**：

```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "username": "testuser",
    "role": "普通用户"
  }
}
```

### 2. 服务状态检查

**请求**：

- URL: `/api/status`
- 方法: GET

**响应**：

```json
{
  "success": true,
  "message": "服务运行正常",
  "timestamp": "2023-11-10T12:00:00Z"
}
```

## 注意事项

1. 确保Node.js版本 >= 14.0.0
2. Docker环境需要正确安装Docker和Docker Compose
3. 数据文件路径请勿随意修改，保持相对路径一致性
4. 生产环境部署时，请修改默认的测试账号密码
