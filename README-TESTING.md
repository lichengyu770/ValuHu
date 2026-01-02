# 跨浏览器测试集成指南

本项目集成了完整的跨浏览器测试解决方案，支持通过 BrowserStack 和 LambdaTest 平台进行自动化兼容性测试。

## 功能特性

- ✅ **安全的凭证管理**：通过环境变量和 dotenv 实现敏感信息隔离存储
- ✅ **智能端口管理**：自动检测端口冲突，确保测试环境的稳定性
- ✅ **测试数据隔离**：提供独立的测试环境，避免测试数据污染
- ✅ **CI/CD 集成**：支持 GitHub Actions、GitLab CI 等主流持续集成平台
- ✅ **多渠道通知**：支持 Slack 等平台的测试结果通知
- ✅ **增强版测试报告**：生成详细的 JSON 和 HTML 格式测试报告
- ✅ **测试分支策略**：根据不同分支应用不同的测试策略

## 环境准备

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制环境变量模板文件并填写相关信息：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填写您的平台凭证：

```
BROWSERSTACK_USERNAME=your_browserstack_username
BROWSERSTACK_ACCESS_KEY=your_browserstack_access_key
LAMBDATEST_USERNAME=your_lambdatest_username
LAMBDATEST_ACCESS_KEY=your_lambdatest_access_key
```

> **重要**：.env 文件包含敏感信息，请确保将其添加到 .gitignore 中，切勿提交到代码库。

## 使用方法

### 运行测试命令

#### 快速测试模式

快速测试仅使用主要浏览器组合，适合日常开发：

```bash
# BrowserStack 快速测试
npm run test:browserstack:quick

# LambdaTest 快速测试
npm run test:lambdatest:quick

# 所有平台快速测试
npm run test:all-browsers -- --quick
```

#### 完整测试模式

完整测试使用所有配置的浏览器组合，适合发布前验证：

```bash
# BrowserStack 完整测试
npm run test:browserstack

# LambdaTest 完整测试
npm run test:lambdatest

# 所有平台完整测试
npm run test:all-browsers
```

#### 跳过服务器启动

如果您已经启动了开发服务器，可以使用 `--skip-server` 参数跳过服务器启动步骤：

```bash
npm run test:all-browsers -- --skip-server
```

## 测试报告

测试完成后，报告将生成在 `test-reports` 目录中：

- `browser-test-report.json`：详细的 JSON 格式报告
- `browser-test-report.html`：可视化 HTML 报告

报告包含以下内容：

- 测试时间戳和环境信息
- 浏览器测试统计数据（总测试数、通过数、失败数、通过率）
- 详细的错误信息和截图链接
- 优化建议和警告信息

## CI/CD 集成

项目已配置 GitHub Actions 工作流，位于 `.github/workflows/browser-tests.yml`。您可以通过以下方式配置：

1. 在 GitHub 仓库设置中添加以下 Secrets：
   - `BROWSERSTACK_USERNAME`
   - `BROWSERSTACK_ACCESS_KEY`
   - `LAMBDATEST_USERNAME`
   - `LAMBDATEST_ACCESS_KEY`
   - `SLACK_WEBHOOK_URL`（可选，用于通知）

2. 触发测试：
   - 推送到 main 或 develop 分支
   - 创建或更新 PR
   - 手动触发工作流（可选择测试平台和模式）

## 测试分支策略

- **main 分支**：运行完整测试套件，确保发布质量
- **develop 分支**：运行快速测试，加速开发迭代
- **PR 分支**：运行快速测试，及时发现问题

## 故障排除

### 常见问题

1. **凭证错误**：
   - 检查 `.env` 文件中的凭证是否正确
   - 确保没有多余的空格或引号

2. **端口冲突**：
   - 使用 `--skip-server` 参数手动指定端口
   - 或修改 `.env` 文件中的 `DEFAULT_PORT` 值

3. **测试超时**：
   - 检查网络连接
   - 增加 `TEST_TIMEOUT` 环境变量值

4. **CI 环境问题**：
   - 验证 GitHub Secrets 是否正确设置
   - 检查构建日志中的详细错误信息

## 配置文件说明

- `cypress.config.js`：Cypress 主配置文件
- `browserstack.config.js`：BrowserStack 特定配置
- `lambdatest.config.js`：LambdaTest 特定配置
- `scripts/run-browser-tests.js`：测试运行脚本

## 自定义测试

如需添加新的测试用例，请在 `cypress/e2e` 目录下创建新的 `.cy.js` 文件。

## 最佳实践

1. **本地开发时使用快速模式**，完整模式仅在必要时使用
2. **始终在提交代码前运行测试**
3. **定期更新测试用例**以覆盖新功能
4. **及时修复失败的测试**，避免技术债务积累
5. **在 CI/CD 流程中集成测试**，确保代码质量

## 联系与支持

如有任何问题或建议，请联系项目维护团队。
