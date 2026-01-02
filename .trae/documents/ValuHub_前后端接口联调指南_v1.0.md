# ValuHub 前后端接口联调指南

## 概述

本文档提供了 ValuHub 前后端接口联调的详细指南，包括API文档说明、前端集成方案、错误处理策略和联调流程。

## API文档访问

### 1. Swagger UI（交互式API文档）
- **本地环境**: http://localhost:8000/docs
- **生产环境**: https://api.valuhub.com/docs

### 2. ReDoc（美观的API文档）
- **本地环境**: http://localhost:8000/redoc
- **生产环境**: https://api.valuhub.com/redoc

### 3. OpenAPI规范文件
- **文件路径**: `backend/openapi.yaml`
- **格式**: OpenAPI 3.0.0

## 认证机制

### JWT Token获取流程

```typescript
// 1. 用户登录获取token
const loginResponse = await authAPI.login({
  username: 'testuser',
  password: 'password123'
})

// 2. 保存token到localStorage
localStorage.setItem('access_token', loginResponse.access_token)

// 3. 后续请求自动携带token（通过axios拦截器）
```

### Token使用示例

```typescript
// 手动携带token的请求
const response = await axios.get('/api/v1/properties', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

## API接口分类

### 1. 认证接口（/api/v1/auth）

#### 1.1 用户注册
```typescript
// 接口路径: POST /api/v1/auth/register
// 请求参数:
{
  username: string,      // 用户名，3-50字符
  email: string,         // 邮箱，符合邮箱格式
  password: string,      // 密码，至少6位
  role: string,          // 角色: individual|government|enterprise|academic|developer
  phone: string          // 手机号，11位数字
}

// 响应数据:
{
  id: number,
  username: string,
  email: string,
  role: string,
  phone: string,
  status: string,
  created_at: string,
  access_token: string
}
```

#### 1.2 用户登录
```typescript
// 接口路径: POST /api/v1/auth/login
// 请求参数:
{
  username: string,
  password: string
}

// 响应数据:
{
  access_token: string,
  token_type: string,
  user: {
    id: number,
    username: string,
    email: string,
    role: string,
    ...
  }
}
```

#### 1.3 获取用户信息
```typescript
// 接口路径: GET /api/v1/auth/profile
// 请求头: Authorization: Bearer <token>
// 响应数据: User对象
```

### 2. 房产接口（/api/v1/properties）

#### 2.1 获取房产列表
```typescript
// 接口路径: GET /api/v1/properties
// 查询参数:
{
  page: number,          // 页码，默认1
  page_size: number,     // 每页数量，默认10
  city: string,          // 城市筛选
  district: string,      // 区域筛选
  property_type: string  // 房产类型筛选
}

// 响应数据:
{
  items: Property[],
  total: number,
  page: number,
  page_size: number
}
```

#### 2.2 创建房产
```typescript
// 接口路径: POST /api/v1/properties
// 请求参数:
{
  address: string,           // 地址，必填
  city: string,              // 城市，必填
  district: string,          // 区域，必填
  area: number,              // 面积，必填
  floor_level: number,       // 楼层
  total_floors: number,      // 总楼层
  building_year: number,     // 建成年份
  property_type: string,      // 房产类型: residential|commercial|industrial
  orientation: string,       // 朝向
  decoration_status: string, // 装修状态
  rooms: number,             // 房间数
  bathrooms: number,        // 卫生间数
  latitude: number,         // 纬度
  longitude: number         // 经度
}

// 响应数据: Property对象
```

#### 2.3 更新房产
```typescript
// 接口路径: PUT /api/v1/properties/{property_id}
// 请求参数: PropertyUpdate对象（所有字段可选）
// 响应数据: Property对象
```

#### 2.4 删除房产
```typescript
// 接口路径: DELETE /api/v1/properties/{property_id}
// 响应数据: { message: string }
```

#### 2.5 搜索房产
```typescript
// 接口路径: GET /api/v1/properties/search
// 查询参数:
{
  city: string,
  district: string,
  min_price: number,
  max_price: number,
  min_area: number,
  max_area: number,
  property_type: string
}

// 响应数据: PropertyListResponse
```

#### 2.6 批量导入房产
```typescript
// 接口路径: POST /api/v1/properties/batch-import
// 请求参数:
{
  properties: PropertyCreate[]
}

// 响应数据:
{
  imported_count: number,
  imported_properties: Property[]
}
```

### 3. 估价接口（/api/v1/valuations）

#### 3.1 创建估价
```typescript
// 接口路径: POST /api/v1/valuations
// 请求参数:
{
  property_id: number,    // 房产ID，必填
  model_type: string      // 模型类型: linear|random_forest|ensemble
}

// 响应数据:
{
  id: number,
  property_id: number,
  estimated_price: number,      // 估价金额
  confidence_level: number,      // 置信度 0-1
  features: object,              // 估价特征
  result_details: object,        // 详细结果
  created_at: string
}
```

#### 3.2 批量创建估价
```typescript
// 接口路径: POST /api/v1/valuations/batch
// 请求参数:
{
  property_ids: number[],
  model_type: string
}

// 响应数据:
{
  valuations: Valuation[]
}
```

#### 3.3 获取房产的估价记录
```typescript
// 接口路径: GET /api/v1/valuations/property/{property_id}
// 响应数据: ValuationListResponse
```

### 4. 报告接口（/api/v1/reports）

#### 4.1 生成报告
```typescript
// 接口路径: POST /api/v1/reports
// 请求参数:
{
  valuation_id: number,   // 估价ID，必填
  template_id: number,    // 模板ID，必填
  format: string          // 格式: pdf|excel|word
}

// 响应数据:
{
  id: number,
  valuation_id: number,
  template_id: number,
  format: string,
  status: string,        // pending|generating|completed|failed
  file_url: string,
  created_at: string
}
```

#### 4.2 下载报告
```typescript
// 接口路径: GET /api/v1/reports/{report_id}/download
// 响应: 二进制文件流
```

#### 4.3 获取报告模板列表
```typescript
// 接口路径: GET /api/v1/reports/templates
// 响应数据:
{
  items: [
    {
      id: number,
      name: string,
      description: string,
      format: string
    }
  ]
}
```

### 5. 数据接口（/api/v1/data）

#### 5.1 获取区域统计数据
```typescript
// 接口路径: GET /api/v1/data/area-statistics
// 查询参数:
{
  city: string,      // 必填
  district: string   // 可选
}

// 响应数据:
{
  city: string,
  district: string,
  avg_price: number,
  avg_price_per_sqm: number,
  property_count: number,
  min_price: number,
  max_price: number
}
```

#### 5.2 获取价格趋势
```typescript
// 接口路径: GET /api/v1/data/price-trend
// 查询参数:
{
  city: string,
  district: string,
  start_date: string,  // YYYY-MM-DD
  end_date: string     // YYYY-MM-DD
}

// 响应数据:
{
  city: string,
  district: string,
  start_date: string,
  end_date: string,
  trend_data: [
    {
      date: string,
      avg_price: number,
      count: number
    }
  ]
}
```

#### 5.3 导出数据
```typescript
// 接口路径: POST /api/v1/data/export/properties
// 请求参数:
{
  format: string,      // excel|csv|json
  filters: object
}

// 响应数据:
{
  download_url: string
}
```

#### 5.4 获取市场概览
```typescript
// 接口路径: GET /api/v1/data/market-overview
// 响应数据:
{
  total_properties: number,
  total_valuations: number,
  total_reports: number,
  avg_price: number,
  avg_confidence_level: number,
  popular_cities: [
    {
      city: string,
      count: number
    }
  ]
}
```

## 前端集成方案

### 1. API客户端配置

#### 1.1 Axios实例配置
```typescript
// src/utils/request.ts
import axios from 'axios'
import { Toast } from 'antd-mobile'

const baseURL = process.env.TARO_APP_API_BASE_URL || 'http://localhost:8000/api/v1'

const instance = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      switch (status) {
        case 401:
          Toast.show('登录已过期，请重新登录')
          localStorage.removeItem('access_token')
          // 跳转到登录页
          break
        case 403:
          Toast.show('无权限访问')
          break
        case 404:
          Toast.show('请求的资源不存在')
          break
        case 422:
          Toast.show(data.detail || '参数验证失败')
          break
        case 500:
          Toast.show('服务器错误，请稍后重试')
          break
        default:
          Toast.show('网络错误，请稍后重试')
      }
    } else if (error.request) {
      Toast.show('网络连接失败，请检查网络')
    } else {
      Toast.show('请求失败，请稍后重试')
    }
    return Promise.reject(error)
  }
)

export default instance
```

### 2. API接口封装

#### 2.1 认证API
```typescript
// src/api/auth.ts
import request from '@/utils/request'

export interface LoginParams {
  username: string
  password: string
}

export interface RegisterParams {
  username: string
  email: string
  password: string
  role: string
  phone: string
}

export const authAPI = {
  login: (params: LoginParams) => request.post('/auth/login', params),
  register: (params: RegisterParams) => request.post('/auth/register', params),
  logout: () => request.post('/auth/logout'),
  getProfile: () => request.get('/auth/profile')
}
```

#### 2.2 房产API
```typescript
// src/api/property.ts
import request from '@/utils/request'

export interface PropertyParams {
  address: string
  city: string
  district: string
  area: number
  floor_level?: number
  total_floors?: number
  building_year?: number
  property_type?: string
  orientation?: string
  decoration_status?: string
  rooms?: number
  bathrooms?: number
  latitude?: number
  longitude?: number
}

export const propertyAPI = {
  create: (params: PropertyParams) => request.post('/properties', params),
  list: (params?: any) => request.get('/properties', { params }),
  detail: (id: number) => request.get(`/properties/${id}`),
  update: (id: number, params: Partial<PropertyParams>) => 
    request.put(`/properties/${id}`, params),
  delete: (id: number) => request.delete(`/properties/${id}`),
  search: (params: any) => request.get('/properties/search', { params }),
  batchImport: (properties: PropertyParams[]) => 
    request.post('/properties/batch-import', { properties })
}
```

#### 2.3 估价API
```typescript
// src/api/valuation.ts
import request from '@/utils/request'

export const valuationAPI = {
  create: (params: { property_id: number; model_type?: string }) => 
    request.post('/valuations', params),
  list: (params?: any) => request.get('/valuations', { params }),
  detail: (id: number) => request.get(`/valuations/${id}`),
  batchCreate: (params: { property_ids: number[]; model_type?: string }) => 
    request.post('/valuations/batch', params),
  getByProperty: (propertyId: number) => 
    request.get(`/valuations/property/${propertyId}`)
}
```

#### 2.4 报告API
```typescript
// src/api/report.ts
import request from '@/utils/request'

export const reportAPI = {
  create: (params: { valuation_id: number; template_id: number; format: string }) => 
    request.post('/reports', params),
  list: (params?: any) => request.get('/reports', { params }),
  detail: (id: number) => request.get(`/reports/${id}`),
  delete: (id: number) => request.delete(`/reports/${id}`),
  download: (id: number) => request.get(`/reports/${id}/download`, { responseType: 'blob' }),
  getTemplates: () => request.get('/reports/templates')
}
```

#### 2.5 数据API
```typescript
// src/api/data.ts
import request from '@/utils/request'

export const dataAPI = {
  getAreaStatistics: (params: { city: string; district?: string }) => 
    request.get('/data/area-statistics', { params }),
  getPriceTrend: (params: { city: string; district?: string; start_date: string; end_date: string }) => 
    request.get('/data/price-trend', { params }),
  getPropertyTypeDistribution: (params: { city: string; district?: string }) => 
    request.get('/data/property-type-distribution', { params }),
  exportProperties: (params: { format: string; filters?: any }) => 
    request.post('/data/export/properties', params),
  exportValuations: (params: { format: string; filters?: any }) => 
    request.post('/data/export/valuations', params),
  exportReports: (params: { format: string; filters?: any }) => 
    request.post('/data/export/reports', params),
  getMarketOverview: () => request.get('/data/market-overview')
}
```

### 3. 状态管理集成

#### 3.1 Redux Slice配置
```typescript
// src/store/slices/propertySlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { propertyAPI } from '@/api/property'

export const fetchProperties = createAsyncThunk(
  'property/fetchProperties',
  async (params: any) => {
    const response = await propertyAPI.list(params)
    return response
  }
)

export const createProperty = createAsyncThunk(
  'property/createProperty',
  async (params: any) => {
    const response = await propertyAPI.create(params)
    return response
  }
)

const propertySlice = createSlice({
  name: 'property',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.total = action.payload.total
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  }
})

export default propertySlice.reducer
```

#### 3.2 React Query集成
```typescript
// src/hooks/useProperties.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { propertyAPI } from '@/api/property'

export const useProperties = (params?: any) => {
  return useQuery({
    queryKey: ['properties', params],
    queryFn: () => propertyAPI.list(params)
  })
}

export const useCreateProperty = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: propertyAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
    }
  })
}

export const useDeleteProperty = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: propertyAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
    }
  })
}
```

### 4. 组件集成示例

#### 4.1 房产列表组件
```typescript
// src/pages/PropertyList.tsx
import React from 'react'
import { useProperties } from '@/hooks/useProperties'
import { List, Card } from 'antd-mobile'

const PropertyList: React.FC = () => {
  const { data, isLoading, error } = useProperties({ page: 1, page_size: 10 })

  if (isLoading) return <div>加载中...</div>
  if (error) return <div>加载失败</div>

  return (
    <List>
      {data?.items.map((property: any) => (
        <List.Item key={property.id}>
          <Card title={property.address}>
            <div>面积: {property.area}㎡</div>
            <div>城市: {property.city}</div>
            <div>区域: {property.district}</div>
          </Card>
        </List.Item>
      ))}
    </List>
  )
}

export default PropertyList
```

#### 4.2 创建房产组件
```typescript
// src/pages/CreateProperty.tsx
import React, { useState } from 'react'
import { Form, Input, InputNumber, Button } from 'antd-mobile'
import { useCreateProperty } from '@/hooks/useProperties'
import { useNavigate } from 'react-router-dom'

const CreateProperty: React.FC = () => {
  const [form] = Form.useForm()
  const createProperty = useCreateProperty()
  const navigate = useNavigate()

  const onFinish = async (values: any) => {
    try {
      await createProperty.mutateAsync(values)
      navigate('/properties')
    } catch (error) {
      console.error('创建失败', error)
    }
  }

  return (
    <Form form={form} onFinish={onFinish}>
      <Form.Item name="address" label="地址" rules={[{ required: true }]}>
        <Input placeholder="请输入地址" />
      </Form.Item>
      <Form.Item name="city" label="城市" rules={[{ required: true }]}>
        <Input placeholder="请输入城市" />
      </Form.Item>
      <Form.Item name="district" label="区域" rules={[{ required: true }]}>
        <Input placeholder="请输入区域" />
      </Form.Item>
      <Form.Item name="area" label="面积" rules={[{ required: true }]}>
        <InputNumber placeholder="请输入面积" />
      </Form.Item>
      <Button type="submit" loading={createProperty.isPending}>
        提交
      </Button>
    </Form>
  )
}

export default CreateProperty
```

## 错误处理策略

### 1. HTTP状态码处理

| 状态码 | 处理策略 |
|--------|---------|
| 200 | 成功，正常处理数据 |
| 201 | 创建成功，刷新列表 |
| 400 | 参数错误，显示错误信息 |
| 401 | 未认证，跳转登录页 |
| 403 | 无权限，显示权限不足 |
| 404 | 资源不存在，显示404页面 |
| 422 | 验证失败，显示字段错误 |
| 500 | 服务器错误，显示错误提示 |

### 2. 网络错误处理

```typescript
// 网络错误重试机制
const retryRequest = async (fn: () => Promise<any>, retries = 3) => {
  try {
    return await fn()
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return retryRequest(fn, retries - 1)
    }
    throw error
  }
}
```

### 3. 超时处理

```typescript
// 设置请求超时
const instance = axios.create({
  timeout: 30000, // 30秒超时
  timeoutErrorMessage: '请求超时，请稍后重试'
})
```

## 联调流程

### 1. 环境准备

#### 1.1 后端环境
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 1.2 前端环境
```bash
cd frontend
npm install
npm run dev:h5
```

### 2. 联调步骤

#### 2.1 接口测试
1. 使用Swagger UI测试所有接口
2. 验证请求参数和响应数据格式
3. 检查错误处理是否正常

#### 2.2 前端集成
1. 配置API基础URL
2. 实现认证流程
3. 集成各个模块的API调用
4. 实现错误处理

#### 2.3 功能测试
1. 测试用户注册和登录
2. 测试房产CRUD操作
3. 测试估价功能
4. 测试报告生成
5. 测试数据导出

#### 2.4 问题修复
1. 记录联调中发现的问题
2. 分类问题（前端/后端/接口）
3. 优先修复P0问题
4. 逐步解决P1和P2问题

### 3. 联调检查清单

- [ ] 所有接口都能正常访问
- [ ] 认证机制正常工作
- [ ] 请求参数验证正确
- [ ] 响应数据格式正确
- [ ] 错误处理完善
- [ ] 加载状态显示正常
- [ ] 分页功能正常
- [ ] 搜索功能正常
- [ ] 批量操作正常
- [ ] 文件下载正常
- [ ] 数据导出正常

## 常见问题

### 1. CORS跨域问题
```typescript
// 后端配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 2. Token过期问题
```typescript
// 自动刷新token
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const response = await authAPI.refreshToken({ refresh_token: refreshToken })
          localStorage.setItem('access_token', response.access_token)
          return instance.request(error.config)
        } catch (refreshError) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)
```

### 3. 大文件上传问题
```typescript
// 配置大文件上传
const instance = axios.create({
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})
```

### 4. 并发请求问题
```typescript
// 使用Promise.all处理并发请求
const [properties, valuations] = await Promise.all([
  propertyAPI.list(),
  valuationAPI.list()
])
```

## 性能优化

### 1. 请求缓存
```typescript
// 使用React Query缓存
const { data } = useQuery({
  queryKey: ['properties'],
  queryFn: () => propertyAPI.list(),
  staleTime: 5 * 60 * 1000, // 5分钟内不重新请求
  cacheTime: 10 * 60 * 1000  // 缓存10分钟
})
```

### 2. 请求取消
```typescript
// 取消未完成的请求
const controller = new AbortController()

useEffect(() => {
  return () => {
    controller.abort()
  }
}, [])

const response = await propertyAPI.list({ signal: controller.signal })
```

### 3. 请求节流
```typescript
// 防抖处理搜索请求
import { debounce } from 'lodash'

const debouncedSearch = debounce((keyword: string) => {
  propertyAPI.search({ keyword })
}, 300)
```

## 总结

本文档提供了 ValuHub 前后端接口联调的完整指南，包括：

1. ✅ API文档访问方式
2. ✅ 认证机制说明
3. ✅ 所有接口的详细说明
4. ✅ 前端集成方案
5. ✅ 错误处理策略
6. ✅ 联调流程和检查清单
7. ✅ 常见问题解决方案
8. ✅ 性能优化建议

按照本指南进行联调，可以确保前后端顺利对接，快速完成功能开发。

---

*文档版本: v1.0*  
*创建日期: 2025-12-31*  
*负责人: 「引擎」AI + 「界面」AI*  
*状态: 已完成*
