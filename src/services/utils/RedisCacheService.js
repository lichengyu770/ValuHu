/**
 * Redis缓存服务类
 * 处理与Redis的连接、缓存读写等操作
 * 在前端环境中默认使用内存缓存作为fallback
 */
class RedisCacheService {
  // Redis客户端实例
  static client = null;

  // 默认缓存过期时间（秒）
  static DEFAULT_EXPIRY = 3600; // 1小时

  // 连接状态
  static isConnected = false;

  /**
   * 初始化Redis连接
   * @param {Object} options - Redis连接选项
   * @returns {Promise<void>}
   */
  static async connect(options = {}) {
    try {
      // 如果已经连接，直接返回
      if (this.client && this.isConnected) {
        return;
      }

      // 在前端环境中，直接使用内存缓存作为fallback
      // 不尝试连接真实的Redis服务器，避免构建失败
      console.log('在前端环境中，使用内存缓存作为Redis的fallback');
      this.useMemoryCacheFallback();
    } catch (error) {
      console.error('Redis连接初始化失败:', error);
      this.isConnected = false;
      // 确保使用内存缓存作为fallback
      this.useMemoryCacheFallback();
    }
  }

  /**
   * 使用内存缓存作为 fallback
   */
  static useMemoryCacheFallback() {
    // 实现简单的内存缓存
    const memoryCache = new Map();

    this.client = {
      get: async (key) => {
        const cachedItem = memoryCache.get(key);
        if (!cachedItem) return null;

        // 检查是否过期
        if (cachedItem.expiryTime && Date.now() > cachedItem.expiryTime) {
          memoryCache.delete(key);
          return null;
        }

        return cachedItem.value;
      },
      set: async (key, value, options = {}) => {
        const expiryTime = options.EX || options.expiry || this.DEFAULT_EXPIRY;
        memoryCache.set(key, {
          value,
          expiryTime: expiryTime ? Date.now() + expiryTime * 1000 : null,
        });
        return 'OK';
      },
      del: async (key) => {
        memoryCache.delete(key);
        return 1;
      },
      exists: async (key) => {
        return memoryCache.has(key) ? 1 : 0;
      },
      expire: async (key, seconds) => {
        const cachedItem = memoryCache.get(key);
        if (cachedItem) {
          cachedItem.expiryTime = Date.now() + seconds * 1000;
          memoryCache.set(key, cachedItem);
          return 1;
        }
        return 0;
      },
      disconnect: async () => {
        memoryCache.clear();
        console.log('内存缓存已清空');
      },
    };

    this.isConnected = true;
    console.log('内存缓存 fallback 已初始化');
  }

  /**
   * 设置缓存
   * @param {string} key - 缓存键
   * @param {any} value - 缓存值
   * @param {number} expiry - 过期时间（秒），默认使用全局默认值
   * @returns {Promise<string>} - Redis返回结果
   */
  static async set(key, value, expiry = this.DEFAULT_EXPIRY) {
    try {
      // 确保Redis已连接
      if (!this.client || !this.isConnected) {
        await this.connect();
      }

      // 序列化值
      const serializedValue = JSON.stringify(value);

      // 设置缓存
      return await this.client.set(key, serializedValue, {
        EX: expiry,
      });
    } catch (error) {
      console.error(`设置缓存失败 [${key}]:`, error);
      return null;
    }
  }

  /**
   * 获取缓存
   * @param {string} key - 缓存键
   * @returns {Promise<any>} - 缓存值，如果不存在则返回null
   */
  static async get(key) {
    try {
      // 确保Redis已连接
      if (!this.client || !this.isConnected) {
        await this.connect();
      }

      // 获取缓存值
      const serializedValue = await this.client.get(key);
      if (!serializedValue) {
        return null;
      }

      // 反序列化值
      return JSON.parse(serializedValue);
    } catch (error) {
      console.error(`获取缓存失败 [${key}]:`, error);
      return null;
    }
  }

  /**
   * 删除缓存
   * @param {string} key - 缓存键
   * @returns {Promise<number>} - 删除的键数量
   */
  static async del(key) {
    try {
      // 确保Redis已连接
      if (!this.client || !this.isConnected) {
        await this.connect();
      }

      return await this.client.del(key);
    } catch (error) {
      console.error(`删除缓存失败 [${key}]:`, error);
      return 0;
    }
  }

  /**
   * 检查键是否存在
   * @param {string} key - 缓存键
   * @returns {Promise<boolean>} - 键是否存在
   */
  static async exists(key) {
    try {
      // 确保Redis已连接
      if (!this.client || !this.isConnected) {
        await this.connect();
      }

      const result = await this.client.exists(key);
      return result > 0;
    } catch (error) {
      console.error(`检查缓存键存在性失败 [${key}]:`, error);
      return false;
    }
  }

  /**
   * 设置键的过期时间
   * @param {string} key - 缓存键
   * @param {number} seconds - 过期时间（秒）
   * @returns {Promise<boolean>} - 设置是否成功
   */
  static async expire(key, seconds) {
    try {
      // 确保Redis已连接
      if (!this.client || !this.isConnected) {
        await this.connect();
      }

      const result = await this.client.expire(key, seconds);
      return result > 0;
    } catch (error) {
      console.error(`设置缓存过期时间失败 [${key}]:`, error);
      return false;
    }
  }

  /**
   * 清空所有缓存
   * @returns {Promise<string>} - Redis返回结果
   */
  static async flushAll() {
    try {
      // 确保Redis已连接
      if (!this.client || !this.isConnected) {
        await this.connect();
      }

      return await this.client.flushAll();
    } catch (error) {
      console.error('清空Redis缓存失败:', error);
      return null;
    }
  }

  /**
   * 断开Redis连接
   * @returns {Promise<void>}
   */
  static async disconnect() {
    try {
      if (this.client && this.isConnected) {
        await this.client.disconnect();
        this.isConnected = false;
        console.log('Redis连接已断开');
      }
    } catch (error) {
      console.error('Redis断开连接失败:', error);
    }
  }

  /**
   * 获取当前连接状态
   * @returns {boolean} - 连接状态
   */
  static getConnectionStatus() {
    return this.isConnected;
  }
}

// 导出服务类
export default RedisCacheService;
