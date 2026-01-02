export interface CacheOptions {
  ttl?: number; // 缓存过期时间（毫秒）
  namespace?: string; // 缓存命名空间
}

interface CachedItem<T> {
  value: T;
  timestamp: number;
  ttl?: number;
}

/**
 * 缓存工具类
 */
export class CacheUtils {
  /**
   * 生成带命名空间的缓存键
   */
  static getCacheKey(key: string, options: CacheOptions = {}): string {
    const { namespace } = options;
    return namespace ? `${namespace}:${key}` : key;
  }

  /**
   * 设置缓存
   */
  static set<T>(key: string, value: T, options: CacheOptions = {}): void {
    try {
      const cacheKey = this.getCacheKey(key, options);
      const item: CachedItem<T> = {
        value,
        timestamp: Date.now(),
        ttl: options.ttl,
      };
      localStorage.setItem(cacheKey, JSON.stringify(item));
    } catch (error) {
      console.error('Failed to set cache:', error);
    }
  }

  /**
   * 获取缓存
   */
  static get<T>(key: string, options: CacheOptions = {}): T | null {
    try {
      const cacheKey = this.getCacheKey(key, options);
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;

      const item: CachedItem<T> = JSON.parse(cached);
      
      // 检查缓存是否过期
      if (item.ttl && Date.now() - item.timestamp > item.ttl) {
        // 缓存过期，删除并返回null
        this.remove(key, options);
        return null;
      }

      return item.value;
    } catch (error) {
      console.error('Failed to get cache:', error);
      return null;
    }
  }

  /**
   * 删除缓存
   */
  static remove(key: string, options: CacheOptions = {}): void {
    try {
      const cacheKey = this.getCacheKey(key, options);
      localStorage.removeItem(cacheKey);
    } catch (error) {
      console.error('Failed to remove cache:', error);
    }
  }

  /**
   * 清除指定命名空间下的所有缓存
   */
  static clearNamespace(namespace: string): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${namespace}:`)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Failed to clear namespace:', error);
    }
  }

  /**
   * 清除所有缓存
   */
  static clearAll(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear all cache:', error);
    }
  }

  /**
   * 获取缓存大小
   */
  static getCacheSize(): number {
    try {
      let size = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          if (value) {
            size += key.length + value.length;
          }
        }
      }
      return size;
    } catch (error) {
      console.error('Failed to get cache size:', error);
      return 0;
    }
  }

  /**
   * 检查缓存是否存在
   */
  static has(key: string, options: CacheOptions = {}): boolean {
    try {
      const cacheKey = this.getCacheKey(key, options);
      return localStorage.getItem(cacheKey) !== null;
    } catch (error) {
      console.error('Failed to check cache existence:', error);
      return false;
    }
  }

  /**
   * 获取缓存剩余有效期
   */
  static getRemainingTTL(key: string, options: CacheOptions = {}): number | null {
    try {
      const cacheKey = this.getCacheKey(key, options);
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;

      const item: CachedItem<any> = JSON.parse(cached);
      if (!item.ttl) return null;

      const remaining = item.ttl - (Date.now() - item.timestamp);
      return Math.max(0, remaining);
    } catch (error) {
      console.error('Failed to get remaining TTL:', error);
      return null;
    }
  }

  /**
   * 批量设置缓存
   */
  static batchSet<T>(items: Array<{ key: string; value: T }>, options: CacheOptions = {}): void {
    items.forEach(({ key, value }) => {
      this.set(key, value, options);
    });
  }

  /**
   * 批量获取缓存
   */
  static batchGet<T>(keys: string[], options: CacheOptions = {}): Array<T | null> {
    return keys.map(key => this.get<T>(key, options));
  }

  /**
   * 批量删除缓存
   */
  static batchRemove(keys: string[], options: CacheOptions = {}): void {
    keys.forEach(key => this.remove(key, options));
  }

  /**
   * 获取指定命名空间下的所有缓存键
   */
  static getKeysByNamespace(namespace: string): string[] {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${namespace}:`)) {
          // 移除命名空间前缀
          keys.push(key.replace(`${namespace}:`, ''));
        }
      }
      return keys;
    } catch (error) {
      console.error('Failed to get keys by namespace:', error);
      return [];
    }
  }

  /**
   * 使用会话存储设置缓存
   */
  static setSession<T>(key: string, value: T, options: CacheOptions = {}): void {
    try {
      const cacheKey = this.getCacheKey(key, options);
      const item: CachedItem<T> = {
        value,
        timestamp: Date.now(),
        ttl: options.ttl,
      };
      sessionStorage.setItem(cacheKey, JSON.stringify(item));
    } catch (error) {
      console.error('Failed to set session cache:', error);
    }
  }

  /**
   * 使用会话存储获取缓存
   */
  static getSession<T>(key: string, options: CacheOptions = {}): T | null {
    try {
      const cacheKey = this.getCacheKey(key, options);
      const cached = sessionStorage.getItem(cacheKey);
      if (!cached) return null;

      const item: CachedItem<T> = JSON.parse(cached);
      
      // 检查缓存是否过期
      if (item.ttl && Date.now() - item.timestamp > item.ttl) {
        // 缓存过期，删除并返回null
        this.removeSession(key, options);
        return null;
      }

      return item.value;
    } catch (error) {
      console.error('Failed to get session cache:', error);
      return null;
    }
  }

  /**
   * 使用会话存储删除缓存
   */
  static removeSession(key: string, options: CacheOptions = {}): void {
    try {
      const cacheKey = this.getCacheKey(key, options);
      sessionStorage.removeItem(cacheKey);
    } catch (error) {
      console.error('Failed to remove session cache:', error);
    }
  }

  /**
   * 清除会话存储中的所有缓存
   */
  static clearSession(): void {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Failed to clear all session cache:', error);
    }
  }
}

/**
 * 本地存储装饰器，用于将类方法的返回值缓存到localStorage
 */
export function Cacheable(options: CacheOptions = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // 生成缓存键
      const argsKey = JSON.stringify(args);
      const methodKey = `${propertyKey}:${argsKey}`;
      const cacheKey = CacheUtils.getCacheKey(methodKey, options);

      // 尝试从缓存获取
      const cached = CacheUtils.get<any>(cacheKey, options);
      if (cached) {
        return cached;
      }

      // 执行原始方法
      const result = await originalMethod.apply(this, args);

      // 缓存结果
      CacheUtils.set(cacheKey, result, options);

      return result;
    };

    return descriptor;
  };
}

/**
 * 会话存储装饰器，用于将类方法的返回值缓存到sessionStorage
 */
export function SessionCacheable(options: CacheOptions = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // 生成缓存键
      const argsKey = JSON.stringify(args);
      const methodKey = `${propertyKey}:${argsKey}`;
      const cacheKey = CacheUtils.getCacheKey(methodKey, options);

      // 尝试从缓存获取
      const cached = CacheUtils.getSession<any>(cacheKey, options);
      if (cached) {
        return cached;
      }

      // 执行原始方法
      const result = await originalMethod.apply(this, args);

      // 缓存结果
      CacheUtils.setSession(cacheKey, result, options);

      return result;
    };

    return descriptor;
  };
}