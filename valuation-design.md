# 房产估价功能设计文档

## 一、系统架构设计

### 1. 整体架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           客户端 (Browser)                             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           前端应用 (HTML/CSS/JS)                        │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐    │
│  │   输入模块        │  │   结果展示模块    │  │   二次估价模块    │    │
│  └───────────────────┘  └───────────────────┘  └───────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           API网关 (Express)                           │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐    │
│  │   认证授权        │  │   请求路由        │  │   响应处理        │    │
│  └───────────────────┘  └───────────────────┘  └───────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           业务逻辑层 (Node.js)                          │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐    │
│  │   房产信息处理    │  │   估价计算逻辑    │  │   历史记录管理    │    │
│  └───────────────────┘  └───────────────────┘  └───────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           数据访问层 (ORM)                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                  ┌────────────────┴────────────────┐
                  │                                │
                  ▼                                ▼
┌────────────────────────────┐      ┌────────────────────────────┐
│        数据库 (MongoDB)     │      │        AI估价服务        │
│  ┌──────────────────────┐  │      │  ┌────────────────────┐  │
│  │   房产信息表         │  │      │  │   估价模型          │  │
│  ├──────────────────────┤  │      │  ├────────────────────┤  │
│  │   估价结果表         │  │      │  │   模型训练          │  │
│  ├──────────────────────┤  │      │  ├────────────────────┤  │
│  │   估价历史表         │  │      │  │   模型评估          │  │
│  └──────────────────────┘  │      │  └────────────────────┘  │
└────────────────────────────┘      └────────────────────────────┘
```

### 2. 各层职责

| 层级 | 职责 | 技术栈 |
|------|------|--------|
| 客户端 | 用户交互界面 | HTML/CSS/JavaScript |
| 前端应用 | 输入验证、结果展示、交互逻辑 | JavaScript (ES6+), Chart.js |
| API网关 | 请求路由、认证授权、响应处理 | Express.js |
| 业务逻辑层 | 核心业务逻辑、数据处理 | Node.js |
| 数据访问层 | 数据库交互、ORM | Mongoose/SQLAlchemy |
| 数据库 | 数据存储 | MongoDB/MySQL |
| AI估价服务 | 房产估价计算 | Python, TensorFlow |

## 二、数据模型设计

### 1. 房产信息 (Property)

```json
{
  "_id": "ObjectId",
  "address": {
    "province": "String",
    "city": "String",
    "district": "String",
    "street": "String",
    "detail": "String"
  },
  "basicInfo": {
    "area": "Number",        // 面积（平方米）
    "layout": "String",      // 户型（如：2室1厅）
    "orientation": "String", // 朝向（如：南北通透）
    "floor": "Number",       // 所在楼层
    "totalFloors": "Number", // 总楼层
    "yearBuilt": "Number",   // 建成年份
    "buildingType": "String" // 建筑类型（如：高层、多层）
  },
  "features": {
    "hasElevator": "Boolean",    // 是否有电梯
    "hasParking": "Boolean",     // 是否有车位
    "hasBalcony": "Boolean",     // 是否有阳台
    "decoration": "String"       // 装修情况（如：精装、简装）
  },
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### 2. 估价结果 (ValuationResult)

```json
{
  "_id": "ObjectId",
  "propertyId": "ObjectId",        // 关联房产ID
  "userId": "ObjectId",            // 关联用户ID（可选）
  "valuationInfo": {
    "totalPrice": "Number",        // 总估价（元）
    "unitPrice": "Number",         // 单价（元/平方米）
    "confidence": "Number",        // 置信度（0-100）
    "valuationDate": "Date",       // 估价日期
    "algorithm": "String"          // 使用的算法
  },
  "marketInfo": {
    "avgPrice": "Number",          // 周边平均价格
    "priceTrend": "Number",        // 价格趋势（-1: 下降, 0: 稳定, 1: 上升）
    "similarProperties": "Number"   // 相似房产数量
  },
  "detailInfo": {
    "factors": [                    // 影响因素及权重
      { "factor": "area", "weight": "Number", "score": "Number" },
      { "factor": "location", "weight": "Number", "score": "Number" },
      { "factor": "layout", "weight": "Number", "score": "Number" },
      { "factor": "yearBuilt", "weight": "Number", "score": "Number" }
    ],
    "notes": "String"               // 估价说明
  },
  "createdAt": "Date"
}
```

### 3. 估价历史 (ValuationHistory)

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",            // 关联用户ID
  "propertyId": "ObjectId",        // 关联房产ID
  "resultId": "ObjectId",          // 关联估价结果ID
  "valuationDate": "Date",         // 估价日期
  "createdAt": "Date"
}
```

## 三、API接口设计

### 1. 房产估价接口

#### 请求
```
POST /api/valuation
Content-Type: application/json

{
  "property": {
    "address": {
      "province": "北京市",
      "city": "北京市",
      "district": "朝阳区",
      "street": "建国路",
      "detail": "88号"
    },
    "basicInfo": {
      "area": 100,
      "layout": "2室1厅",
      "orientation": "南北通透",
      "floor": 5,
      "totalFloors": 20,
      "yearBuilt": 2010,
      "buildingType": "高层"
    },
    "features": {
      "hasElevator": true,
      "hasParking": true,
      "hasBalcony": true,
      "decoration": "精装"
    }
  },
  "options": {
    "algorithm": "default",
    "detailLevel": "basic"
  }
}
```

#### 响应
```json
{
  "success": true,
  "data": {
    "valuation": {
      "totalPrice": 5000000,
      "unitPrice": 50000,
      "confidence": 95,
      "valuationDate": "2026-01-01T10:00:00Z",
      "algorithm": "default"
    },
    "marketInfo": {
      "avgPrice": 48000,
      "priceTrend": 1,
      "similarProperties": 15
    },
    "resultId": "60a3f7b8e4d3a2c1b0e9f8a7"
  },
  "message": "估价成功"
}
```

### 2. 获取估价结果详情

#### 请求
```
GET /api/valuation/:id
```

#### 响应
```json
{
  "success": true,
  "data": {
    "_id": "60a3f7b8e4d3a2c1b0e9f8a7",
    "propertyId": "60a3f7b8e4d3a2c1b0e9f8a6",
    "valuationInfo": {
      "totalPrice": 5000000,
      "unitPrice": 50000,
      "confidence": 95,
      "valuationDate": "2026-01-01T10:00:00Z",
      "algorithm": "default"
    },
    "marketInfo": {
      "avgPrice": 48000,
      "priceTrend": 1,
      "similarProperties": 15
    },
    "detailInfo": {
      "factors": [
        { "factor": "area", "weight": 0.2, "score": 90 },
        { "factor": "location", "weight": 0.4, "score": 95 },
        { "factor": "layout", "weight": 0.2, "score": 85 },
        { "factor": "yearBuilt", "weight": 0.2, "score": 80 }
      ],
      "notes": "该房产位于朝阳区核心地段，交通便利，周边配套完善，估价结果具有较高参考价值。"
    },
    "createdAt": "2026-01-01T10:00:00Z"
  },
  "message": "获取成功"
}
```

### 3. 获取估价历史

#### 请求
```
GET /api/valuation/history?userId=60a3f7b8e4d3a2c1b0e9f8a5&page=1&limit=10
```

#### 响应
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "_id": "60a3f7b8e4d3a2c1b0e9f8a8",
        "propertyId": "60a3f7b8e4d3a2c1b0e9f8a6",
        "resultId": "60a3f7b8e4d3a2c1b0e9f8a7",
        "valuationDate": "2026-01-01T10:00:00Z",
        "createdAt": "2026-01-01T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  },
  "message": "获取成功"
}
```

### 4. 二次估价接口

#### 请求
```
POST /api/valuation/:id/revaluation
Content-Type: application/json

{
  "options": {
    "algorithm": "advanced",
    "detailLevel": "full",
    "additionalFactors": {
      "schoolDistrict": true,
      "transportation": "地铁5号线",
      "commercial": true
    }
  }
}
```

#### 响应
```json
{
  "success": true,
  "data": {
    "valuation": {
      "totalPrice": 5200000,
      "unitPrice": 52000,
      "confidence": 98,
      "valuationDate": "2026-01-01T10:30:00Z",
      "algorithm": "advanced"
    },
    "resultId": "60a3f7b8e4d3a2c1b0e9f8a9"
  },
  "message": "二次估价成功"
}
```

## 四、前端设计

### 1. 输入表单设计

```html
<form id="valuation-form">
  <div class="form-section">
    <h3>基本信息</h3>
    <div class="form-group">
      <label for="province">省份</label>
      <input type="text" id="province" name="province" required>
    </div>
    <div class="form-group">
      <label for="city">城市</label>
      <input type="text" id="city" name="city" required>
    </div>
    <div class="form-group">
      <label for="district">区域</label>
      <input type="text" id="district" name="district" required>
    </div>
    <div class="form-group">
      <label for="street">街道</label>
      <input type="text" id="street" name="street" required>
    </div>
    <div class="form-group">
      <label for="detail">详细地址</label>
      <input type="text" id="detail" name="detail" required>
    </div>
  </div>
  
  <div class="form-section">
    <h3>房产信息</h3>
    <div class="form-group">
      <label for="area">面积 (平方米)</label>
      <input type="number" id="area" name="area" min="1" required>
    </div>
    <div class="form-group">
      <label for="layout">户型</label>
      <input type="text" id="layout" name="layout" required>
    </div>
    <div class="form-group">
      <label for="orientation">朝向</label>
      <select id="orientation" name="orientation" required>
        <option value="">请选择朝向</option>
        <option value="南北通透">南北通透</option>
        <option value="朝南">朝南</option>
        <option value="朝北">朝北</option>
        <option value="朝东">朝东</option>
        <option value="朝西">朝西</option>
      </select>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label for="floor">楼层</label>
        <input type="number" id="floor" name="floor" min="1" required>
      </div>
      <div class="form-group">
        <label for="totalFloors">总楼层</label>
        <input type="number" id="totalFloors" name="totalFloors" min="1" required>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label for="yearBuilt">建成年份</label>
        <input type="number" id="yearBuilt" name="yearBuilt" min="1900" max="2026" required>
      </div>
      <div class="form-group">
        <label for="buildingType">建筑类型</label>
        <select id="buildingType" name="buildingType" required>
          <option value="">请选择建筑类型</option>
          <option value="高层">高层</option>
          <option value="多层">多层</option>
          <option value="小高层">小高层</option>
          <option value="别墅">别墅</option>
        </select>
      </div>
    </div>
  </div>
  
  <div class="form-section">
    <h3>附加信息</h3>
    <div class="checkbox-group">
      <input type="checkbox" id="hasElevator" name="hasElevator">
      <label for="hasElevator">有电梯</label>
    </div>
    <div class="checkbox-group">
      <input type="checkbox" id="hasParking" name="hasParking">
      <label for="hasParking">有车位</label>
    </div>
    <div class="checkbox-group">
      <input type="checkbox" id="hasBalcony" name="hasBalcony">
      <label for="hasBalcony">有阳台</label>
    </div>
    <div class="form-group">
      <label for="decoration">装修情况</label>
      <select id="decoration" name="decoration" required>
        <option value="">请选择装修情况</option>
        <option value="精装">精装</option>
        <option value="简装">简装</option>
        <option value="毛坯">毛坯</option>
      </select>
    </div>
  </div>
  
  <button type="submit" class="btn-primary">开始估价</button>
</form>
```

### 2. 结果展示设计

```html
<div class="result-section" id="result-section" style="display: none;">
  <div class="result-header">
    <h2>估价结果</h2>
    <div class="result-meta">
      <span class="valuation-date">估价日期：<span id="valuation-date"></span></span>
      <span class="confidence">置信度：<span id="confidence"></span>%</span>
    </div>
  </div>
  
  <div class="result-main">
    <div class="total-price">
      <span id="total-price">0</span>
      <span class="unit">元</span>
    </div>
    <div class="unit-price">
      单价：<span id="unit-price">0</span> 元/平方米
    </div>
  </div>
  
  <div class="market-info">
    <h3>市场对比</h3>
    <div class="market-grid">
      <div class="market-item">
        <div class="label">周边均价</div>
        <div class="value" id="avg-price">0</div>
        <div class="unit">元/平方米</div>
      </div>
      <div class="market-item">
        <div class="label">价格趋势</div>
        <div class="value" id="price-trend">稳定</div>
      </div>
      <div class="market-item">
        <div class="label">相似房产</div>
        <div class="value" id="similar-properties">0</div>
        <div class="unit">套</div>
      </div>
    </div>
  </div>
  
  <div class="detail-info">
    <h3>影响因素</h3>
    <div class="factors-chart">
      <canvas id="factors-chart"></canvas>
    </div>
  </div>
  
  <div class="action-buttons">
    <button class="btn-secondary" onclick="showForm()">重新估价</button>
    <button class="btn-primary" onclick="revaluation()">详细估价</button>
  </div>
</div>
```

## 五、开发计划

### 1. 开发顺序

1. 数据库设计与创建
2. 后端API开发
3. 前端表单开发
4. 前端结果展示开发
5. AI估价服务开发与集成
6. 系统测试与优化

### 2. 关键里程碑

| 里程碑 | 时间 | 交付物 |
|--------|------|--------|
| 数据库设计完成 | 第1周 | 数据模型文档 |
| 核心API开发完成 | 第3周 | API接口文档 |
| 前端基本功能完成 | 第5周 | 可运行的前端应用 |
| AI服务集成完成 | 第7周 | 完整的估价功能 |
| 系统测试完成 | 第8周 | 测试报告 |
| 系统上线 | 第9周 | 上线报告 |

## 六、注意事项

1. **安全性**：所有API接口必须进行认证授权，防止恶意调用
2. **性能**：对于大量并发请求，需要进行缓存和负载均衡
3. **可扩展性**：系统设计应考虑未来功能扩展，如支持更多估价算法
4. **用户体验**：表单设计应简洁明了，结果展示应直观易懂
5. **数据隐私**：用户数据必须进行加密存储，保护用户隐私
6. **合规性**：遵守相关法律法规，如数据保护法

## 七、后续优化方向

1. 支持更多房产类型（别墅、商业地产等）
2. 集成第三方地图服务，自动获取房产位置信息
3. 提供更详细的市场分析报告
4. 支持估价结果导出（PDF、Excel等）
5. 增加估价历史对比功能
6. 优化AI算法，提高估价准确性
7. 支持多语言和多地区

---

**文档版本**: 1.0  
**创建日期**: 2026-01-01  
**更新日期**: 2026-01-01  
**作者**: ValuHub开发团队