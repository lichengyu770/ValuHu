# 估价接口规范文档

## 1. 接口概述

### 1.1 功能描述

提供房产估价服务，根据输入的房产参数，返回预估的房产价值、单价及估价报告ID。

### 1.2 接口路径

```
POST /api/estimate
```

### 1.3 请求方式

`POST`

## 2. 请求参数

### 2.1 请求头

| 字段名       | 类型   | 必填 | 描述                                  |
| ------------ | ------ | ---- | ------------------------------------- |
| Content-Type | string | 是   | 请求体类型，固定为 `application/json` |

### 2.2 请求体

#### 2.2.1 基础参数

| 字段名        | 类型   | 必填 | 描述               | 示例值      | 约束条件                             |
| ------------- | ------ | ---- | ------------------ | ----------- | ------------------------------------ |
| area          | number | 是   | 房产面积（平方米） | 150.0       | 大于0，最多2位小数                   |
| city          | string | 是   | 城市名称           | "长沙"      | 非空字符串                           |
| district      | string | 是   | 区域名称           | "岳麓区"    | 非空字符串                           |
| rooms         | string | 是   | 户型               | "3室2厅1卫" | 非空字符串                           |
| floor         | number | 是   | 所在楼层           | 10          | 大于0的整数                          |
| total_floors  | number | 是   | 总楼层             | 30          | 大于0的整数，大于等于所在楼层        |
| building_year | number | 是   | 建筑年份           | 2015        | 1900-当前年份+1                      |
| property_type | string | 是   | 房产类型           | "住宅"      | 只能是：住宅、商业、工业             |
| orientation   | string | 是   | 朝向               | "南北通透"  | 非空字符串                           |
| decoration    | string | 是   | 装修情况           | "精装"      | 只能是：毛坯、简装、中装、精装、豪装 |

#### 2.2.2 示例请求

```json
{
  "area": 150.0,
  "city": "长沙",
  "district": "岳麓区",
  "rooms": "3室2厅1卫",
  "floor": 10,
  "total_floors": 30,
  "building_year": 2015,
  "property_type": "住宅",
  "orientation": "南北通透",
  "decoration": "精装"
}
```

## 3. 响应参数

### 3.1 成功响应

#### 3.1.1 响应头

| 字段名       | 类型   | 描述                                  |
| ------------ | ------ | ------------------------------------- |
| Content-Type | string | 响应体类型，固定为 `application/json` |

#### 3.1.2 响应体

| 字段名               | 类型   | 描述                       | 示例值                 |
| -------------------- | ------ | -------------------------- | ---------------------- |
| code                 | number | 响应状态码，成功为 200     | 200                    |
| message              | string | 响应消息，成功为 "success" | "success"              |
| data                 | object | 响应数据，包含估价结果     | -                      |
| data.price           | number | 估价总价（元）             | 1250000                |
| data.unitPrice       | number | 估价单价（元/平方米）      | 8333                   |
| data.reportId        | string | 估价报告ID                 | "EST-12345"            |
| data.confidenceLevel | number | 估价置信度（0-100）        | 90                     |
| data.valuationMethod | string | 估价方法                   | "市场比较法"           |
| data.timestamp       | string | 估价时间戳                 | "2024-01-01T12:00:00Z" |

#### 3.1.3 示例响应

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "price": 1250000,
    "unitPrice": 8333,
    "reportId": "EST-12345",
    "confidenceLevel": 90,
    "valuationMethod": "市场比较法",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

### 3.2 错误响应

#### 3.2.1 响应体

| 字段名           | 类型   | 描述                          |
| ---------------- | ------ | ----------------------------- |
| code             | number | 响应状态码，错误为 4xx 或 5xx |
| message          | string | 错误消息                      |
| data             | null   | 错误响应数据为 null           |
| errors           | array  | 错误详情列表（可选）          |
| errors[].field   | string | 错误字段名                    |
| errors[].message | string | 字段错误消息                  |

#### 3.2.2 示例错误响应

```json
{
  "code": 400,
  "message": "参数验证失败",
  "data": null,
  "errors": [
    {
      "field": "area",
      "message": "面积必须大于0"
    },
    {
      "field": "floor",
      "message": "所在楼层不能超过总楼层"
    }
  ]
}
```

## 4. 特殊场景响应

### 4.1 接口超时

- 状态码：504
- 响应体：

```json
{
  "code": 504,
  "message": "请求超时，请稍后重试",
  "data": null
}
```

### 4.2 服务器错误

- 状态码：500
- 响应体：

```json
{
  "code": 500,
  "message": "服务器内部错误，请稍后重试",
  "data": null
}
```

## 5. 接口版本

### 5.1 当前版本

`v1.0.0`

### 5.2 版本更新记录

| 版本号 | 更新时间   | 更新内容     |
| ------ | ---------- | ------------ |
| v1.0.0 | 2024-01-01 | 初始版本发布 |

## 6. 使用说明

### 6.1 Mock接口调用

```javascript
// 前端调用示例
fetch('/api/estimate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    area: 150.0,
    city: '长沙',
    district: '岳麓区',
    rooms: '3室2厅1卫',
    floor: 10,
    total_floors: 30,
    building_year: 2015,
    property_type: '住宅',
    orientation: '南北通透',
    decoration: '精装',
  }),
})
  .then((response) => response.json())
  .then((data) => {
    console.log('估价结果:', data);
    // 处理估价结果
  })
  .catch((error) => {
    console.error('估价失败:', error);
    // 处理错误
  });
```

### 6.2 真实接口切换

通过修改配置参数，可一键切换至真实接口：

```javascript
// 切换配置
const API_CONFIG = {
  useMock: false, // false：使用真实接口，true：使用Mock接口
  baseUrl: 'https://api.real-estate.com',
};
```

## 7. 测试用例

### 7.1 正常请求测试

- 请求参数：完整且合法的房产参数
- 预期响应：200 OK，返回正确的估价结果

### 7.2 缺少必填参数测试

- 请求参数：缺少area字段
- 预期响应：400 Bad Request，提示"面积不能为空"

### 7.3 参数格式错误测试

- 请求参数：area为负数
- 预期响应：400 Bad Request，提示"面积必须大于0"

### 7.4 边界值测试

- 请求参数：area为1.0（最小值）
- 预期响应：200 OK，返回合理的估价结果

### 7.5 特殊场景测试

- 请求参数：正确的参数
- 预期响应：504 Timeout，模拟接口超时

## 8. 注意事项

1. 接口调用频率限制：每分钟最多100次请求
2. 请求体大小限制：最大10MB
3. 响应时间：正常情况下不超过2秒
4. 接口返回的数据为预估值，仅供参考
5. 估价报告ID有效期为7天
