import { useState, useCallback, useEffect } from 'react';

type CacheType = 'local' | 'session';

export interface CacheOptions {
  type?: CacheType;
  ttl?: number; // 缓存过期时间（毫秒）
}

interface CachedItem<T> {
  value: T;
  timestamp: number;
  ttl?: number;
}

export function useCache<T>(key: string, options: CacheOptions = {}) {
  const { type = 'local', ttl } = options;
  const [value, setValue] = useState<T | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  // 获取存储对象
  const storage = type === 'local' ? localStorage : sessionStorage;

  // 检查缓存是否过期
  const checkExpiry = useCallback((item: CachedItem<T>): boolean => {
    if (!item.ttl) return false;
    return Date.now() - item.timestamp > item.ttl;
  }, []);

  // 从缓存获取值
  const getValue = useCallback((): T | null => {
    const storedValue = storage.getItem(key);
    if (!storedValue) return null;

    try {
      const parsedItem: CachedItem<T> = JSON.parse(storedValue);
      if (checkExpiry(parsedItem)) {
        // 缓存过期，删除并返回null
        storage.removeItem(key);
        setIsExpired(true);
        return null;
      }
      setIsExpired(false);
      return parsedItem.value;
    } catch (error) {
      console.error('Failed to parse cached value:', error);
      storage.removeItem(key);
      return null;
    }
  }, [key, storage, checkExpiry]);

  // 设置缓存值
  const setCache = useCallback((newValue: T) => {
    const item: CachedItem<T> = {
      value: newValue,
      timestamp: Date.now(),
      ttl,
    };
    storage.setItem(key, JSON.stringify(item));
    setValue(newValue);
    setIsExpired(false);
  }, [key, storage, ttl]);

  // 删除缓存值
  const removeCache = useCallback(() => {
    storage.removeItem(key);
    setValue(null);
    setIsExpired(false);
  }, [key, storage]);

  // 刷新缓存值
  const refreshCache = useCallback(() => {
    const currentValue = getValue();
    if (currentValue !== null) {
      setCache(currentValue);
    }
  }, [getValue, setCache]);

  // 初始化时从缓存加载值
  useEffect(() => {
    const initialValue = getValue();
    setValue(initialValue);
  }, [getValue]);

  return {
    value,
    isExpired,
    setCache,
    removeCache,
    refreshCache,
    getValue,
  };
}

// 批量缓存Hook
export function useBatchCache<T>(keys: string[], options: CacheOptions = {}) {
  const [values, setValues] = useState<Record<string, T | null>>({});
  const [expiredKeys, setExpiredKeys] = useState<string[]>([]);

  const { type = 'local' } = options;
  const storage = type === 'local' ? localStorage : sessionStorage;

  // 初始化时从缓存加载所有值
  useEffect(() => {
    const loadedValues: Record<string, T | null> = {};
    const expired: string[] = [];

    keys.forEach((key) => {
      const storedValue = storage.getItem(key);
      if (storedValue) {
        try {
          const parsedItem: CachedItem<T> = JSON.parse(storedValue);
          if (options.ttl && Date.now() - parsedItem.timestamp > options.ttl) {
            // 缓存过期
            expired.push(key);
            loadedValues[key] = null;
            storage.removeItem(key);
          } else {
            loadedValues[key] = parsedItem.value;
          }
        } catch (error) {
          console.error(`Failed to parse cached value for key ${key}:`, error);
          loadedValues[key] = null;
          storage.removeItem(key);
        }
      } else {
        loadedValues[key] = null;
      }
    });

    setValues(loadedValues);
    setExpiredKeys(expired);
  }, [keys, storage, options.ttl]);

  // 设置单个缓存值
  const setCacheItem = useCallback((key: string, value: T) => {
    const item: CachedItem<T> = {
      value,
      timestamp: Date.now(),
      ttl: options.ttl,
    };
    storage.setItem(key, JSON.stringify(item));
    setValues((prev) => ({ ...prev, [key]: value }));
    setExpiredKeys((prev) => prev.filter((k) => k !== key));
  }, [storage, options.ttl]);

  // 删除单个缓存值
  const removeCacheItem = useCallback((key: string) => {
    storage.removeItem(key);
    setValues((prev) => {
      const newValues = { ...prev };
      delete newValues[key];
      return newValues;
    });
    setExpiredKeys((prev) => prev.filter((k) => k !== key));
  }, [storage]);

  // 清空所有缓存值
  const clearAllCache = useCallback(() => {
    keys.forEach((key) => {
      storage.removeItem(key);
    });
    const newValues: Record<string, T | null> = {};
    keys.forEach((key) => {
      newValues[key] = null;
    });
    setValues(newValues);
    setExpiredKeys([]);
  }, [keys, storage]);

  return {
    values,
    expiredKeys,
    setCacheItem,
    removeCacheItem,
    clearAllCache,
  };
}