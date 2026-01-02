# 贡献指南

## 分支管理策略

我们采用Git Flow分支管理策略，主要分支包括：

### 主要分支

- **main**：主分支，用于发布生产版本
- **develop**：开发分支，包含所有最新的开发代码

### 支持分支

- **feature/xxx**：功能分支，用于开发新功能
- **hotfix/xxx**：热修复分支，用于修复生产环境的紧急Bug
- **release/xxx**：发布分支，用于准备新版本发布

### 分支创建与合并流程

1. 从`develop`分支创建功能分支：`git checkout -b feature/your-feature develop`
2. 开发完成后，提交代码并推送到远程仓库
3. 在GitHub/GitLab上创建Pull Request，将功能分支合并到`develop`
4. 经过代码审查通过后，合并分支
5. 发布新版本时，从`develop`创建`release`分支，进行测试和准备
6. 发布完成后，将`release`分支合并到`main`和`develop`
7. 对于生产环境的紧急Bug，从`main`创建`hotfix`分支，修复后合并回`main`和`develop`

## 代码提交规范

我们采用[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)规范，提交信息格式如下：

```
<类型>[可选的作用域]: <描述>

[可选的正文]

[可选的页脚]
```

### 提交类型

- **feat**：新功能
- **fix**：修复Bug
- **docs**：仅文档更改
- **style**：不影响代码含义的更改（空格、格式、缺少分号等）
- **refactor**：既不修复Bug也不添加功能的代码更改
- **perf**：提高性能的代码更改
- **test**：添加或修改测试
- **chore**：更改构建流程或辅助工具
- **revert**：回滚先前的提交

### 示例

```
feat: 添加用户注册功能

添加了手机号验证码注册和密码登录功能

fix: 修复估价结果显示错误

修复了面积大于100平米时估价结果计算错误的问题

docs: 更新API接口文档

添加了新的支付接口文档
```

## 代码审查流程

1. 提交Pull Request前，请确保：
   - 代码已通过所有测试
   - 代码符合项目的代码风格
   - 已添加必要的文档和注释
   - 提交信息符合规范

2. 提交Pull Request时：
   - 填写清晰的标题和描述，说明更改的内容和原因
   - 关联相关的Issue
   - 指定至少1名 reviewer

3. Reviewer在审查代码时，应关注：
   - 代码的正确性和安全性
   - 代码的可读性和可维护性
   - 代码是否符合项目的架构和设计原则
   - 是否有足够的测试覆盖

4. 对于需要修改的代码，Reviewer应提出具体的修改建议
5. 当所有审查意见都已解决，且至少有1名Reviewer批准后，方可合并Pull Request

## 报告Bug和提出Feature Request

### 报告Bug

1. 在GitHub/GitLab上创建Issue
2. 选择"Bug Report"模板
3. 填写以下信息：
   - Bug的详细描述
   - 复现步骤
   - 预期结果
   - 实际结果
   - 环境信息（操作系统、浏览器、版本等）
   - 截图（如果适用）

### 提出Feature Request

1. 在GitHub/GitLab上创建Issue
2. 选择"Feature Request"模板
3. 填写以下信息：
   - 功能的详细描述
   - 功能的使用场景
   - 功能的预期效果
   - 设计建议（如果有）

## 代码风格

### Python后端

- 遵循PEP 8代码风格
- 使用Black进行代码格式化
- 使用mypy进行类型检查
- 使用Flake8进行代码质量检查

### JavaScript前端

- 遵循ESLint代码风格
- 使用Prettier进行代码格式化
- 采用ES6+语法

## 测试

1. 所有新功能必须添加相应的测试
2. 提交代码前，必须通过所有现有测试
3. 后端测试：使用pytest运行测试套件
4. 前端测试：使用Jest运行单元测试，使用Cypress运行端到端测试

## 文档

1. 所有API接口必须有完整的文档
2. 所有公共函数和类必须有文档字符串
3. 复杂的业务逻辑必须有注释说明
4. 文档应与代码同步更新

## 开发环境设置

### 后端开发环境

1. 克隆仓库：`git clone https://github.com/your-repo/property-valuation-system.git`
2. 进入backend目录：`cd backend`
3. 创建虚拟环境：`python -m venv venv`
4. 激活虚拟环境：
   - Linux/macOS：`source venv/bin/activate`
   - Windows：`venv\Scripts\activate`
5. 安装依赖：`pip install -r requirements.txt`
6. 启动开发服务器：`uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`

### 前端开发环境

1. 安装依赖：`npm install`
2. 启动开发服务器：`npm run dev`
3. 构建生产版本：`npm run build`

## 联系我们

如有任何问题或建议，请联系项目开发团队。