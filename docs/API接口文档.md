# 房产数据管理系统 - API接口文档

## 1. 接口概述

本文档详细描述房产数据管理系统的所有API接口定义，包括认证接口、用户管理、房产信息管理、评估管理、证书管理等模块的接口规范。系统采用RESTful API设计风格。

## 2. 基础信息

### 2.1 接口基础URL

```
http://[服务器IP]:[端口]/api/v1
```

### 2.2 请求头格式

所有API请求（除登录接口外）都需要在请求头中携带以下认证信息：

```
Authorization: Bearer [JWT Token]
Content-Type: application/json
```

### 2.3 响应格式

统一响应格式：

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

错误响应格式：

```json
{
  "code": 400,
  "message": "错误信息描述",
  "data": null
}
```

## 3. 认证接口

### 3.1 用户登录

**接口URL**: `/auth/login`

**请求方法**: `POST`

**请求参数**:

| 参数名     | 类型     | 必填 | 描述   |
| :--------- | :------- | :--- | :----- |
| `username` | `string` | 是   | 用户名 |
| `password` | `string` | 是   | 密码   |

**请求示例**:

```json
{
  "username": "admin",
  "password": "123456"
}
```

**成功响应**:

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin",
      "status": 1
    }
  }
}
```

### 3.2 用户登出

**接口URL**: `/auth/logout`

**请求方法**: `POST`

**成功响应**:

```json
{
  "code": 200,
  "message": "登出成功",
  "data": null
}
```

## 4. 用户管理接口

### 4.1 获取用户列表

**接口URL**: `/users`

**请求方法**: `GET`

**请求参数** (Query参数):

| 参数名     | 类型     | 必填 | 描述             |
| :--------- | :------- | :--- | :--------------- |
| `page`     | `number` | 否   | 页码，默认1      |
| `pageSize` | `number` | 否   | 每页数量，默认10 |
| `username` | `string` | 否   | 用户名搜索       |
| `role`     | `string` | 否   | 角色筛选         |

**成功响应**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "username": "admin",
        "role": "admin",
        "status": 1,
        "created_at": "2023-01-01 12:00:00"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10
  }
}
```

### 4.2 创建用户

**接口URL**: `/users`

**请求方法**: `POST`

**请求参数**:

| 参数名     | 类型     | 必填 | 描述                 |
| :--------- | :------- | :--- | :------------------- |
| `username` | `string` | 是   | 用户名               |
| `password` | `string` | 是   | 密码                 |
| `role`     | `string` | 是   | 角色(admin/user)     |
| `status`   | `number` | 是   | 状态(1:启用, 0:禁用) |

**成功响应**:

```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": 2,
    "username": "test",
    "role": "user",
    "status": 1
  }
}
```

### 4.3 更新用户

**接口URL**: `/users/:id`

**请求方法**: `PUT`

**请求参数**:

| 参数名     | 类型     | 必填 | 描述       |
| :--------- | :------- | :--- | :--------- |
| `password` | `string` | 否   | 密码(可选) |
| `role`     | `string` | 否   | 角色(可选) |
| `status`   | `number` | 否   | 状态(可选) |

**成功响应**:

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 2,
    "username": "test",
    "role": "admin",
    "status": 1
  }
}
```

### 4.4 删除用户

**接口URL**: `/users/:id`

**请求方法**: `DELETE`

**成功响应**:

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

## 5. 房产信息管理接口

### 5.1 获取房产列表

**接口URL**: `/properties`

**请求方法**: `GET`

**请求参数** (Query参数):

| 参数名          | 类型     | 必填 | 描述             |
| :-------------- | :------- | :--- | :--------------- |
| `page`          | `number` | 否   | 页码，默认1      |
| `pageSize`      | `number` | 否   | 每页数量，默认10 |
| `property_code` | `string` | 否   | 房产编码搜索     |
| `property_name` | `string` | 否   | 房产名称搜索     |
| `location`      | `string` | 否   | 地理位置搜索     |
| `type`          | `string` | 否   | 房产类型筛选     |

**成功响应**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "property_code": "PROP2023001",
        "property_name": "明珠大厦",
        "location": "北京市朝阳区建国路88号",
        "area": 12000.5,
        "type": "办公楼",
        "construction_year": 2015,
        "status": "active",
        "created_at": "2023-01-01 12:00:00"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10
  }
}
```

### 5.2 创建房产信息

**接口URL**: `/properties`

**请求方法**: `POST`

**请求参数**:

| 参数名              | 类型     | 必填 | 描述     |
| :------------------ | :------- | :--- | :------- |
| `property_code`     | `string` | 是   | 房产编码 |
| `property_name`     | `string` | 是   | 房产名称 |
| `location`          | `string` | 是   | 地理位置 |
| `area`              | `number` | 是   | 面积     |
| `type`              | `string` | 是   | 房产类型 |
| `construction_year` | `number` | 否   | 建造年份 |
| `description`       | `string` | 否   | 房产描述 |

**成功响应**:

```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": 1,
    "property_code": "PROP2023001",
    "property_name": "明珠大厦",
    "location": "北京市朝阳区建国路88号",
    "area": 12000.5,
    "type": "办公楼",
    "construction_year": 2015,
    "status": "active"
  }
}
```

### 5.3 更新房产信息

**接口URL**: `/properties/:id`

**请求方法**: `PUT`

**请求参数**:

| 参数名              | 类型     | 必填 | 描述     |
| :------------------ | :------- | :--- | :------- |
| `property_name`     | `string` | 否   | 房产名称 |
| `location`          | `string` | 否   | 地理位置 |
| `area`              | `number` | 否   | 面积     |
| `type`              | `string` | 否   | 房产类型 |
| `construction_year` | `number` | 否   | 建造年份 |
| `description`       | `string` | 否   | 房产描述 |
| `status`            | `string` | 否   | 状态     |

**成功响应**:

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 1,
    "property_code": "PROP2023001",
    "property_name": "明珠大厦",
    "location": "北京市朝阳区建国路88号",
    "area": 12000.5,
    "type": "办公楼",
    "construction_year": 2015,
    "description": "高层建筑",
    "status": "active"
  }
}
```

### 5.4 删除房产信息

**接口URL**: `/properties/:id`

**请求方法**: `DELETE`

**成功响应**:

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

### 5.5 获取房产详情

**接口URL**: `/properties/:id`

**请求方法**: `GET`

**成功响应**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "property_code": "PROP2023001",
    "property_name": "明珠大厦",
    "location": "北京市朝阳区建国路88号",
    "area": 12000.5,
    "type": "办公楼",
    "construction_year": 2015,
    "description": "高层建筑",
    "status": "active",
    "created_at": "2023-01-01 12:00:00",
    "updated_at": "2023-01-02 10:00:00"
  }
}
```

## 6. 房产评估管理接口

### 6.1 获取评估列表

**接口URL**: `/evaluations`

**请求方法**: `GET`

**请求参数** (Query参数):

| 参数名            | 类型     | 必填 | 描述             |
| :---------------- | :------- | :--- | :--------------- |
| `page`            | `number` | 否   | 页码，默认1      |
| `pageSize`        | `number` | 否   | 每页数量，默认10 |
| `property_id`     | `number` | 否   | 房产ID筛选       |
| `evaluation_type` | `string` | 否   | 评估类型筛选     |

**成功响应**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "property_id": 1,
        "property_name": "明珠大厦",
        "evaluation_type": "GIS",
        "evaluation_value": 150000000.0,
        "evaluation_date": "2023-06-15",
        "evaluator": "评估机构A",
        "created_by": 1,
        "created_at": "2023-06-15 14:30:00"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10
  }
}
```

### 6.2 创建评估记录

**接口URL**: `/evaluations`

**请求方法**: `POST`

**请求参数**:

| 参数名             | 类型     | 必填 | 描述         |
| :----------------- | :------- | :--- | :----------- |
| `property_id`      | `number` | 是   | 房产ID       |
| `evaluation_type`  | `string` | 是   | 评估类型     |
| `evaluation_value` | `number` | 是   | 评估价值     |
| `evaluation_date`  | `string` | 是   | 评估日期     |
| `evaluator`        | `string` | 否   | 评估人       |
| `methodology`      | `string` | 否   | 评估方法说明 |

**成功响应**:

```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": 1,
    "property_id": 1,
    "evaluation_type": "GIS",
    "evaluation_value": 150000000.0,
    "evaluation_date": "2023-06-15"
  }
}
```

### 6.3 上传评估报告

**接口URL**: `/evaluations/:id/upload-report`

**请求方法**: `POST`

**请求格式**: `multipart/form-data`

**请求参数**:

| 参数名        | 类型   | 必填 | 描述         |
| :------------ | :----- | :--- | :----------- |
| `report_file` | `file` | 是   | 评估报告文件 |

**成功响应**:

```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "report_url": "/uploads/evaluations/report_12345.pdf"
  }
}
```

## 7. 电子证书管理接口

### 7.1 获取证书列表

**接口URL**: `/certificates`

**请求方法**: `GET`

**请求参数** (Query参数):

| 参数名             | 类型     | 必填 | 描述             |
| :----------------- | :------- | :--- | :--------------- |
| `page`             | `number` | 否   | 页码，默认1      |
| `pageSize`         | `number` | 否   | 每页数量，默认10 |
| `property_id`      | `number` | 否   | 房产ID筛选       |
| `certificate_type` | `string` | 否   | 证书类型筛选     |
| `status`           | `string` | 否   | 状态筛选         |

**成功响应**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "certificate_number": "CERT2023001",
        "property_id": 1,
        "property_name": "明珠大厦",
        "certificate_type": "所有权证",
        "issue_date": "2023-01-15",
        "expiry_date": "2033-01-15",
        "status": "valid",
        "created_by": 1,
        "created_at": "2023-01-15 10:00:00"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10
  }
}
```

### 7.2 创建证书信息

**接口URL**: `/certificates`

**请求方法**: `POST`

**请求参数**:

| 参数名               | 类型     | 必填 | 描述     |
| :------------------- | :------- | :--- | :------- |
| `certificate_number` | `string` | 是   | 证书编号 |
| `property_id`        | `number` | 是   | 房产ID   |
| `certificate_type`   | `string` | 是   | 证书类型 |
| `issue_date`         | `string` | 是   | 颁发日期 |
| `expiry_date`        | `string` | 否   | 到期日期 |
| `issuing_authority`  | `string` | 否   | 颁发机构 |

**成功响应**:

```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": 1,
    "certificate_number": "CERT2023001",
    "property_id": 1,
    "certificate_type": "所有权证",
    "issue_date": "2023-01-15",
    "status": "valid"
  }
}
```

### 7.3 上传证书文件

**接口URL**: `/certificates/:id/upload-file`

**请求方法**: `POST`

**请求格式**: `multipart/form-data`

**请求参数**:

| 参数名      | 类型   | 必填 | 描述     |
| :---------- | :----- | :--- | :------- |
| `cert_file` | `file` | 是   | 证书文件 |

**成功响应**:

```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "cert_file_url": "/uploads/certificates/cert_12345.pdf"
  }
}
```

## 8. 系统日志与监控接口

### 8.1 获取操作日志

**接口URL**: `/logs/operations`

**请求方法**: `GET`

**请求参数** (Query参数):

| 参数名           | 类型     | 必填 | 描述             |
| :--------------- | :------- | :--- | :--------------- |
| `page`           | `number` | 否   | 页码，默认1      |
| `pageSize`       | `number` | 否   | 每页数量，默认10 |
| `username`       | `string` | 否   | 用户名搜索       |
| `operation_type` | `string` | 否   | 操作类型筛选     |
| `start_date`     | `string` | 否   | 开始日期         |
| `end_date`       | `string` | 否   | 结束日期         |

**成功响应**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "user_id": 1,
        "username": "admin",
        "operation_type": "login",
        "operation_desc": "用户登录系统",
        "ip_address": "192.168.1.100",
        "created_at": "2023-01-01 12:00:00"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10
  }
}
```

### 8.2 获取系统监控数据

**接口URL**: `/monitor/metrics`

**请求方法**: `GET`

**请求参数** (Query参数):

| 参数名        | 类型     | 必填 | 描述     |
| :------------ | :------- | :--- | :------- |
| `metric_name` | `string` | 否   | 指标名称 |
| `start_time`  | `string` | 是   | 开始时间 |
| `end_time`    | `string` | 是   | 结束时间 |

**成功响应**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "metric_name": "cpu_usage",
      "metric_value": 25.5,
      "metric_unit": "%",
      "monitor_time": "2023-01-01 12:00:00"
    },
    {
      "metric_name": "memory_usage",
      "metric_value": 60.2,
      "metric_unit": "%",
      "monitor_time": "2023-01-01 12:00:00"
    }
  ]
}
```

## 9. 系统配置管理接口

### 9.1 获取系统配置

**接口URL**: `/configs`

**请求方法**: `GET`

**成功响应**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "system_name": "房产数据管理系统",
    "max_upload_size": 10485760,
    "default_page_size": 10,
    "token_expire_hours": 24
  }
}
```

### 9.2 更新系统配置

**接口URL**: `/configs/:key`

**请求方法**: `PUT`

**请求参数**:

| 参数名         | 类型     | 必填 | 描述   |
| :------------- | :------- | :--- | :----- |
| `config_value` | `string` | 是   | 配置值 |

**成功响应**:

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "config_key": "default_page_size",
    "config_value": "20"
  }
}
```
