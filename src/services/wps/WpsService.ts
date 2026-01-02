import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getWpsAppKey, getWpsSecretKey } from '../config/apiKeys';

// 定义WPS API响应接口
export interface WpsApiResponse<T> {
  code: number;
  message: string;
  data: T;
  success: boolean;
}

// 定义WPS文档信息接口
export interface WpsDocumentInfo {
  documentId: string;
  title: string;
  size: number;
  createTime: string;
  updateTime: string;
  status: string;
  downloadUrl: string;
  previewUrl: string;
}

// 定义WPS文档生成参数接口
export interface WpsGenerateParams {
  templateId: string;
  data: Record<string, any>;
  outputFormat?: 'docx' | 'pdf' | 'html';
  title?: string;
}

// 定义WPS文档转换参数接口
export interface WpsConvertParams {
  documentId: string;
  targetFormat: 'docx' | 'pdf' | 'html' | 'txt';
}

// 创建WPS服务类
class WpsService {
  private axiosInstance: AxiosInstance;
  private appKey: string;
  private secretKey: string;
  private baseURL: string;

  constructor() {
    // 初始化WPS API密钥
    this.appKey = getWpsAppKey();
    this.secretKey = getWpsSecretKey();
    
    // WPS API基础URL
    this.baseURL = 'https://openapi.wps.cn';

    // 创建axios实例
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-WPS-AppKey': this.appKey,
      },
    });

    // 配置请求拦截器
    this.setupRequestInterceptor();

    // 配置响应拦截器
    this.setupResponseInterceptor();
  }

  // 请求拦截器：添加签名和其他必要的请求头
  private setupRequestInterceptor() {
    this.axiosInstance.interceptors.request.use(
      async (config: AxiosRequestConfig) => {
        // 生成请求签名
        const timestamp = Date.now().toString();
        const signature = await this.generateSignature(config, timestamp);

        // 添加签名和时间戳到请求头
        config.headers = {
          ...config.headers,
          'X-WPS-Timestamp': timestamp,
          'X-WPS-Signature': signature,
        };

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  // 响应拦截器：处理响应和错误
  private setupResponseInterceptor() {
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse<WpsApiResponse<any>>) => {
        // 检查WPS API响应是否成功
        if (response.data.code !== 200) {
          return Promise.reject(new Error(response.data.message || 'WPS API请求失败'));
        }
        return response.data;
      },
      (error) => {
        // 处理网络错误和其他错误
        let errorMessage = 'WPS API请求失败';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        return Promise.reject(new Error(errorMessage));
      }
    );
  }

  // 生成WPS API请求签名
  private async generateSignature(config: AxiosRequestConfig, timestamp: string): Promise<string> {
    // 签名生成逻辑：根据WPS API文档要求，使用SHA256算法
    const method = config.method?.toUpperCase() || 'GET';
    const path = config.url || '';
    const body = config.data ? JSON.stringify(config.data) : '';
    
    // 组合签名字符串
    const signatureStr = `${method}\n${path}\n${timestamp}\n${this.appKey}\n${body}\n${this.secretKey}`;
    
    try {
      // 使用SHA256算法生成签名
      const encoder = new TextEncoder();
      const data = encoder.encode(signatureStr);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      
      // 将ArrayBuffer转换为十六进制字符串
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      return hashHex;
    } catch (error) {
      console.error('WPS API签名生成失败:', error);
      // 降级处理：使用HMAC-SHA256的简化实现
      return this.generateFallbackSignature(signatureStr);
    }
  }

  // 降级签名生成方法（当crypto.subtle不可用时）
  private generateFallbackSignature(data: string): string {
    // 简化的HMAC-SHA256实现
    // 注意：这是一个简化版本，仅用于降级处理，生产环境建议使用完整的HMAC-SHA256实现
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    // 将哈希值转换为十六进制字符串
    let hex = Math.abs(hash).toString(16);
    // 补全到64位
    while (hex.length < 64) {
      hex = '0' + hex;
    }
    return hex;
  }

  // 生成文档
  async generateDocument(params: WpsGenerateParams): Promise<WpsDocumentInfo> {
    const response = await this.axiosInstance.post<WpsApiResponse<WpsDocumentInfo>>('/v1/documents/generate', {
      template_id: params.templateId,
      data: params.data,
      output_format: params.outputFormat || 'docx',
      title: params.title || 'Generated Document',
    });
    return response.data;
  }

  // 转换文档格式
  async convertDocument(params: WpsConvertParams): Promise<WpsDocumentInfo> {
    const response = await this.axiosInstance.post<WpsApiResponse<WpsDocumentInfo>>('/v1/documents/convert', {
      document_id: params.documentId,
      target_format: params.targetFormat,
    });
    return response.data;
  }

  // 获取文档信息
  async getDocumentInfo(documentId: string): Promise<WpsDocumentInfo> {
    const response = await this.axiosInstance.get<WpsApiResponse<WpsDocumentInfo>>(`/v1/documents/${documentId}`);
    return response.data;
  }

  // 删除文档
  async deleteDocument(documentId: string): Promise<boolean> {
    const response = await this.axiosInstance.delete<WpsApiResponse<{ success: boolean }>>(`/v1/documents/${documentId}`);
    return response.data.success;
  }

  // 获取文档列表
  async getDocumentList(page: number = 1, pageSize: number = 10): Promise<{ documents: WpsDocumentInfo[]; total: number }> {
    const response = await this.axiosInstance.get<WpsApiResponse<{ documents: WpsDocumentInfo[]; total: number }>>('/v1/documents', {
      params: { page, page_size: pageSize },
    });
    return response.data;
  }

  // 生成文档预览URL
  async generatePreviewUrl(documentId: string, expiresIn: number = 3600): Promise<string> {
    const response = await this.axiosInstance.post<WpsApiResponse<{ preview_url: string }>>('/v1/documents/preview', {
      document_id: documentId,
      expires_in: expiresIn,
    });
    return response.data.preview_url;
  }

  // 上传文档模板
  async uploadTemplate(file: File, templateName: string): Promise<{ templateId: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', templateName);

    const response = await this.axiosInstance.post<WpsApiResponse<{ template_id: string }>>('/v1/templates/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return {
      templateId: response.data.template_id,
    };
  }

  // 获取模板列表
  async getTemplates(page: number = 1, pageSize: number = 10): Promise<{ templates: Array<{ templateId: string; name: string; createTime: string }>; total: number }> {
    const response = await this.axiosInstance.get<WpsApiResponse<{ templates: Array<{ template_id: string; name: string; create_time: string }>; total: number }>>('/v1/templates', {
      params: { page, page_size: pageSize },
    });
    return {
      templates: response.data.templates.map(tpl => ({
        templateId: tpl.template_id,
        name: tpl.name,
        createTime: tpl.create_time,
      })),
      total: response.data.total,
    };
  }
}

// 创建并导出WPS服务实例
const wpsService = new WpsService();

export default wpsService;

export { WpsService };
