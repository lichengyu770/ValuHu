import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import AuthService from './AuthService';

// 定义API响应接口
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errorCode?: string;
}

// 定义API客户端配置
export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  withCredentials?: boolean;
}

// 创建API客户端类
class ApiClient {
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor(config?: ApiClientConfig) {
    // 创建axios实例
    this.axiosInstance = axios.create({
      baseURL: config?.baseURL || import.meta.env.VITE_API_BASE_URL || '/api',
      timeout: config?.timeout || 30000,
      withCredentials: config?.withCredentials || false,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 配置请求拦截器
    this.setupRequestInterceptor();

    // 配置响应拦截器
    this.setupResponseInterceptor();
  }

  // 请求拦截器：添加Authorization头
  private setupRequestInterceptor() {
    this.axiosInstance.interceptors.request.use(
      async (config: AxiosRequestConfig) => {
        // 获取当前访问令牌
        const accessToken = AuthService.getAccessToken();

        // 如果令牌存在且即将过期，尝试刷新
        if (accessToken && AuthService.isTokenAboutToExpire(accessToken)) {
          const newTokens = await AuthService.refreshToken();
          if (newTokens) {
            if (config.headers) {
              config.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            }
          }
        } else if (accessToken && config.headers) {
          // 正常添加Authorization头
          config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );
  }

  // 响应拦截器：处理401错误和令牌刷新
  private setupResponseInterceptor() {
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // 处理401未授权错误
        if (error.response?.status === 401 && !originalRequest._retry) {
          // 防止重复刷新
          if (this.isRefreshing) {
            // 等待令牌刷新完成，然后重试请求
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                resolve(this.axiosInstance(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // 尝试刷新令牌
            const newTokens = await AuthService.refreshToken();
            if (newTokens) {
              // 更新令牌
              AuthService.setTokens(newTokens);
              
              // 通知所有等待的请求
              this.refreshSubscribers.forEach((callback) => callback(newTokens.accessToken));
              this.refreshSubscribers = [];

              // 重试原始请求
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
              }
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            // 刷新失败，清除所有令牌
            AuthService.logout();
            // 可以在这里添加重定向到登录页的逻辑
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // 处理其他错误
        return Promise.reject(this.handleError(error));
      }
    );
  }

  // 统一错误处理
  private handleError(error: AxiosError): ApiError {
    let message = '请求失败，请稍后重试';
    let errorCode = 'UNKNOWN_ERROR';

    if (error.response) {
      // 服务器返回错误响应
      const data = error.response.data as any;
      message = data.message || error.response.statusText || message;
      errorCode = data.errorCode || `HTTP_${error.response.status}`;
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      message = '服务器无响应，请检查网络连接';
      errorCode = 'NETWORK_ERROR';
    } else {
      // 请求配置错误
      message = error.message || message;
      errorCode = 'REQUEST_ERROR';
    }

    return {
      message,
      errorCode,
      originalError: error,
    };
  }

  // GET请求
  async get<T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.get<ApiResponse<T>>(url, {
      params,
      ...config,
    });
    return response.data;
  }

  // POST请求
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  // PUT请求
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  // DELETE请求
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  // PATCH请求
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  // 上传文件
  async upload<T>(url: string, file: File, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.axiosInstance.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...config,
    });
    return response.data;
  }

  // 获取原始axios实例
  getInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

// 定义API错误接口
export interface ApiError {
  message: string;
  errorCode: string;
  originalError: AxiosError;
}

// 创建并导出单例API客户端
const apiClient = new ApiClient();

export default apiClient;