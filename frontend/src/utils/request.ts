import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { Toast } from 'antd-mobile'

const baseURL = process.env.TARO_APP_API_BASE_URL || 'http://localhost:3000/api'

const instance: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 添加认证令牌
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
  (response: AxiosResponse) => {
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
        case 500:
          Toast.show('服务器错误，请稍后重试')
          break
        default:
          Toast.show(data?.message || '请求失败')
      }
    } else if (error.request) {
      Toast.show('网络错误，请检查网络连接')
    } else {
      Toast.show('请求配置错误')
    }
    
    return Promise.reject(error)
  }
)

export default instance
