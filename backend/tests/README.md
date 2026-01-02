# ValuHub 测试指南

## 概述

本文档描述了 ValuHub 项目的测试策略、测试结构和运行方法。

## 测试结构

```
backend/
├── tests/
│   ├── conftest.py          # 测试配置和fixtures
│   ├── test_auth.py         # 认证模块测试
│   ├── test_property.py     # 房产模块测试
│   ├── test_valuation.py    # 估价模块测试
│   ├── test_report.py       # 报告模块测试
│   ├── test_data.py         # 数据导出测试
│   ├── test_integration.py  # 集成测试
│   └── test_models.py       # 模型测试
├── pytest.ini               # pytest配置
├── requirements-test.txt    # 测试依赖
└── .env.test               # 测试环境变量
```

## 测试类型

### 1. 单元测试 (Unit Tests)
- 测试单个函数、类或方法
- 使用 `@pytest.mark.unit` 标记
- 测试文件: `test_models.py`

### 2. 集成测试 (Integration Tests)
- 测试多个模块之间的交互
- 使用 `@pytest.mark.integration` 标记
- 测试文件: `test_integration.py`

### 3. 功能测试 (Functional Tests)
- 测试API端点的功能
- 按模块分类: `test_auth.py`, `test_property.py`, `test_valuation.py`, `test_report.py`, `test_data.py`

## 测试标记

使用pytest标记来分类和组织测试:

```bash
# 运行所有认证相关测试
pytest -m auth

# 运行所有房产相关测试
pytest -m property

# 运行所有估价相关测试
pytest -m valuation

# 运行所有报告相关测试
pytest -m report

# 运行所有数据导出相关测试
pytest -m data

# 运行所有单元测试
pytest -m unit

# 运行所有集成测试
pytest -m integration

# 运行所有慢速测试
pytest -m slow
```

## 运行测试

### 安装测试依赖

```bash
cd backend
pip install -r requirements-test.txt
```

### 运行所有测试

```bash
pytest
```

### 运行特定测试文件

```bash
pytest tests/test_auth.py
```

### 运行特定测试函数

```bash
pytest tests/test_auth.py::test_register_user
```

### 运行带详细输出的测试

```bash
pytest -v
```

### 运行测试并生成覆盖率报告

```bash
# 生成HTML覆盖率报告
pytest --cov=app --cov-report=html

# 生成终端覆盖率报告
pytest --cov=app --cov-report=term-missing

# 生成XML覆盖率报告
pytest --cov=app --cov-report=xml
```

### 运行测试并显示print输出

```bash
pytest -s
```

### 并行运行测试

```bash
pytest -n auto
```

## Fixtures

项目提供了以下fixtures:

### `db_session`
- 创建测试数据库会话
- 每个测试函数独立运行
- 自动清理测试数据

### `client`
- 创建FastAPI测试客户端
- 自动注入测试数据库会话

### `test_user`
- 创建测试用户
- 预设用户名: `testuser`
- 预设密码: `testpassword`

### `test_property`
- 创建测试房产
- 关联到测试用户

### `test_valuation`
- 创建测试估价
- 关联到测试房产

### `auth_headers`
- 生成认证头
- 包含有效的JWT token

## 测试覆盖率目标

- 总体覆盖率: ≥ 80%
- 核心模块覆盖率: ≥ 90%
- API端点覆盖率: 100%

## CI/CD集成

测试将在以下场景自动运行:

1. 每次Pull Request
2. 每次推送到main分支
3. 每日定时任务

## 测试最佳实践

1. **保持测试独立性**: 每个测试应该独立运行,不依赖其他测试
2. **使用fixtures**: 复用测试数据和配置
3. **清晰的测试名称**: 测试名称应该描述测试的内容
4. **适当的断言**: 使用有意义的断言消息
5. **测试边界情况**: 测试正常情况和异常情况
6. **保持测试快速**: 避免不必要的等待和重复操作

## 持续改进

- 定期审查和更新测试用例
- 监控测试覆盖率
- 优化慢速测试
- 添加新的测试用例以覆盖新功能

## 故障排除

### 数据库连接错误
确保测试数据库配置正确:
```bash
cat .env.test
```

### 依赖安装错误
确保所有测试依赖已安装:
```bash
pip install -r requirements-test.txt
```

### 端口冲突
确保没有其他服务占用测试端口:
```bash
netstat -ano | findstr :8000
```

## 联系方式

如有问题,请联系测试团队或创建Issue。
