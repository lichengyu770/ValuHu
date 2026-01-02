import { useState, useEffect, useCallback, useRef, useImperativeHandle } from 'react';
import apiClient from '../services/utils/apiClient';

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  headers?: Record<string, string>;
  immediate?: boolean;
  cacheKey?: string;
  cacheTime?: number;
  retryCount?: number;
  retryDelay?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  status: number | null;
  retryCount: number;
  lastRetry: number | null;
}

export interface ApiRequestResult<T> extends ApiResponse<T> {
  execute: (requestData?: any) => Promise<T>;
  refetch: () => Promise<T>;
  cancel: () => void;
  clearCache: () => void;
  isCanceled: boolean;
}

export function useApiRequest<T = any>(
  url: string,
  options: ApiRequestOptions = {}
): ApiRequestResult<T> {
  const {
    method = 'GET',
    data: initialData,
    headers,
    immediate = true,
    cacheKey,
    cacheTime = 5 * 60 * 1000, // 5分钟
    retryCount = 0,
    retryDelay = 1000, // 1秒
    onSuccess,
    onError,
  } = options;

  const [response, setResponse] = useState<ApiResponse<T>>({
    data: null,
    loading: false,
    error: null,
    status: null,
    retryCount: 0,
    lastRetry: null,
  });

  const [isCanceled, setIsCanceled] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryAttemptsRef = useRef(0);
  const lastRequestTimeRef = useRef<number | null>(null);

  // 缓存管理
  const getCachedData = useCallback(() => {
    if (!cacheKey) return null;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < cacheTime) {
        return data;
      }
    }
    return null;
  }, [cacheKey, cacheTime]);

  const setCachedData = useCallback((data: T) => {
    if (cacheKey) {
      localStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now(),
      }));
    }
  }, [cacheKey]);

  // 清除缓存
  const clearCache = useCallback(() => {
    if (cacheKey) {
      localStorage.removeItem(cacheKey);
    }
  }, [cacheKey]);

  // 取消请求
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsCanceled(true);
    setResponse(prev => ({
      ...prev,
      loading: false,
      error: new Error('Request canceled'),
    }));
  }, []);

  // 重试延迟函数
  const delay = useCallback((ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }, []);

  const execute = useCallback(async (requestData?: any): Promise<T> => {
    // 重置状态
    setIsCanceled(false);
    retryAttemptsRef.current = 0;
    setResponse(prev => ({ 
      ...prev, 
      loading: true, 
      error: null,
      retryCount: 0,
      lastRetry: null,
    }));

    // 创建新的AbortController
    abortControllerRef.current = new AbortController();
    lastRequestTimeRef.current = Date.now();

    try {
      // 检查缓存
      const cachedData = getCachedData();
      if (cachedData && method === 'GET') {
        const cachedResponse: ApiResponse<T> = {
          data: cachedData as T,
          loading: false,
          error: null,
          status: 200,
          retryCount: 0,
          lastRetry: null,
        };
        setResponse(cachedResponse);
        onSuccess?.(cachedData);
        return cachedData as T;
      }

      let result;
      let attempt = 0;

      // 重试循环
      while (attempt <= retryCount) {
        try {
          result = await apiClient.request<T>({
            url,
            method,
            data: requestData || initialData,
            headers,
            signal: abortControllerRef.current?.signal,
          });
          break; // 请求成功，退出循环
        } catch (error) {
          attempt++;
          retryAttemptsRef.current = attempt;
          
          // 如果是取消错误，直接抛出
          if ((error as any).name === 'AbortError') {
            throw error;
          }
          
          // 如果达到最大重试次数，抛出错误
          if (attempt > retryCount) {
            throw error;
          }
          
          // 更新重试状态
          setResponse(prev => ({
            ...prev,
            retryCount: attempt,
            lastRetry: Date.now(),
          }));
          
          // 等待重试延迟
          await delay(retryDelay * Math.pow(2, attempt - 1)); // 指数退避
        }
      }

      // 检查是否已取消
      if (isCanceled) {
        throw new Error('Request canceled');
      }

      const apiResponse: ApiResponse<T> = {
        data: result.data,
        loading: false,
        error: null,
        status: result.status,
        retryCount: attempt - 1,
        lastRetry: attempt > 1 ? Date.now() : null,
      };

      setResponse(apiResponse);
      
      // 缓存结果
      if (method === 'GET' && result.data) {
        setCachedData(result.data);
      }
      
      // 调用成功回调
      onSuccess?.(result.data);
      
      return result.data;
    } catch (error) {
      const err = error as Error;
      
      // 检查是否已取消
      if (isCanceled || (err as any).name === 'AbortError') {
        return Promise.reject(new Error('Request canceled'));
      }
      
      const errorResponse: ApiResponse<T> = {
        data: null,
        loading: false,
        error: err,
        status: null,
        retryCount: retryAttemptsRef.current,
        lastRetry: Date.now(),
      };
      
      setResponse(errorResponse);
      
      // 调用错误回调
      onError?.(err);
      
      return Promise.reject(err);
    } finally {
      abortControllerRef.current = null;
    }
  }, [url, method, initialData, headers, getCachedData, setCachedData, cacheKey, retryCount, retryDelay, delay, onSuccess, onError, isCanceled]);

  // 立即执行请求
  useEffect(() => {
    if (immediate) {
      execute();
    }

    // 清理函数
    return () => {
      cancel();
    };
  }, [execute, immediate, cancel]);

  return {
    ...response,
    execute,
    refetch: execute,
    cancel,
    clearCache,
    isCanceled,
  };
}