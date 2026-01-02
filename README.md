# ValuHu

房产价值生态引擎 - ValuHub前端开发项目

## 项目介绍

ValuHub是一个房产估价生态系统，包含五个终端应用：

1. **ValuHub·安居版**（大众端）- 面向普通用户的估价应用
2. **ValuHub·资管通**（企业端）- 企业级资产管理后台
3. **ValuHub·政务版**（政府端）- 政府数据监控与决策支持系统
4. **ValuHub·学术工坊**（院校端）- 教育实训与科研平台
5. **ValuHub·智库版**（协会端）- 行业研究标准与知识库

## 技术栈

- **框架**：Next.js 15 (App Router)
- **语言**：TypeScript 5.3+
- **样式**：Tailwind CSS 3.4+
- **状态管理**：Zustand
- **API请求**：Axios + React Query
- **UI组件**：自定义ValuHub UI组件库

## 项目结构

```
ValuHu/
├── apps/
│   ├── valuhub-public/      # 安居版（大众端）
│   ├── valuhub-enterprise/  # 资管通（企业端）
│   ├── valuhub-government/  # 政务版（政府端）
│   ├── valuhub-academy/     # 学术工坊（院校端）
│   └── valuhub-association/ # 智库版（协会端）
├── packages/
│   └── valuhub-ui/          # 共享组件库
├── turbo.json               # Turborepo配置
└── package.json             # 根包配置
```

## 开发流程

1. **环境配置**：安装Node.js 18+、Git、VS Code
2. **项目初始化**：使用Turborepo创建Monorepo结构
3. **组件库开发**：开发共享UI组件
4. **终端开发**：五个终端并行开发
5. **联调测试**：前端与后端API联调
6. **部署上线**：部署到Vercel

## 质量指标

- **性能指标**：首次内容绘制（FCP）< 1.5秒
- **可访问性**：WCAG 2.1 AA标准达标
- **响应式**：完美适配手机、平板、桌面
- **代码质量**：TypeScript严格模式，无any类型
- **用户体验**：用户完成核心任务时间 < 30秒

## 贡献指南

1. Fork本仓库
2. 创建特性分支：`git checkout -b feature/AmazingFeature`
3. 提交更改：`git commit -m 'Add some AmazingFeature'`
4. 推送到分支：`git push origin feature/AmazingFeature`
5. 打开Pull Request

## 许可证

MIT License

## 联系方式

如有问题，请联系项目维护者。