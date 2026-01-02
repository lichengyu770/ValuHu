import request from '@/utils/request'

export interface LoginParams {
  username: string
  password: string
}

export interface RegisterParams {
  username: string
  email: string
  password: string
  role: 'individual' | 'government' | 'enterprise' | 'academic' | 'developer'
  phone?: string
}

export interface PropertyParams {
  address: string
  city: string
  district?: string
  area: number
  floor_level?: number
  total_floors?: number
  building_year?: number
  property_type?: 'residential' | 'commercial' | 'industrial'
  rooms?: number
  bathrooms?: number
  orientation?: string
  decoration_status?: string
  latitude?: number
  longitude?: number
}

export interface ValuationParams {
  property_id: number
  model_type?: 'linear' | 'random_forest' | 'ensemble'
}

export interface ReportParams {
  valuation_id: number
  template_id: number
  format: 'pdf' | 'excel' | 'word'
}

// 认证API
export const authAPI = {
  // 用户登录
  login: (params: LoginParams) => 
    request.post('/auth/login', params),
  
  // 用户注册
  register: (params: RegisterParams) => 
    request.post('/auth/register', params),
  
  // 用户登出
  logout: () => 
    request.post('/auth/logout'),
  
  // 获取用户信息
  getProfile: () => 
    request.get('/auth/profile'),
  
  // 更新用户信息
  updateProfile: (params: any) => 
    request.put('/auth/profile', params),
}

// 房产API
export const propertyAPI = {
  // 创建房产
  create: (params: PropertyParams) => 
    request.post('/properties', params),
  
  // 获取房产列表
  list: (params?: any) => 
    request.get('/properties', { params }),
  
  // 获取房产详情
  detail: (id: number) => 
    request.get(`/properties/${id}`),
  
  // 更新房产
  update: (id: number, params: any) => 
    request.put(`/properties/${id}`, params),
  
  // 删除房产
  delete: (id: number) => 
    request.delete(`/properties/${id}`),
  
  // 搜索房产
  search: (params: any) => 
    request.get('/properties/search', { params }),
  
  // 批量导入
  batchImport: (params: { properties: PropertyParams[] }) => 
    request.post('/properties/batch', params),
}

// 估价API
export const valuationAPI = {
  // 创建估价
  create: (params: ValuationParams) => 
    request.post('/valuations', params),
  
  // 获取估价列表
  list: (params?: any) => 
    request.get('/valuations', { params }),
  
  // 获取估价详情
  detail: (id: number) => 
    request.get(`/valuations/${id}`),
  
  // 获取房产估价历史
  propertyHistory: (propertyId: number, params?: any) => 
    request.get(`/valuations/property/${propertyId}`, { params }),
  
  // 批量估价
  batch: (params: { property_ids: number[], model_type?: 'linear' | 'random_forest' | 'ensemble' }) => 
    request.post('/valuations/batch', params),
  
  // 市场趋势
  marketTrend: (params: any) => 
    request.get('/valuations/market-trend', { params }),
}

// 报告API
export const reportAPI = {
  // 生成报告
  generate: (params: ReportParams) => 
    request.post('/reports', params),
  
  // 获取报告列表
  list: (params?: any) => 
    request.get('/reports', { params }),
  
  // 获取报告详情
  detail: (id: number) => 
    request.get(`/reports/${id}`),
  
  // 下载报告
  download: (id: number) => 
    request.get(`/reports/download/${id}`),
  
  // 获取报告模板
  templates: () => 
    request.get('/reports/templates'),
  
  // 创建报告模板
  createTemplate: (params: any) => 
    request.post('/reports/templates', params),
}

// 数据API
export const dataAPI = {
  // 区域统计
  areaStatistics: (params: any) => 
    request.get('/data/area-statistics', { params }),
  
  // 数据导出
  export: (params: any) => 
    request.post('/data/export', params),
}
