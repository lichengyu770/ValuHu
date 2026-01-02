// 缓存工具函数

// 简单的内存缓存实现
class Cache {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 3600; // 默认缓存时间为1小时（秒）
  }

  /**
   * 设置缓存
   * @param {string} key - 缓存键名
   * @param {any} value - 缓存值
   * @param {number} ttl - 缓存时间（秒），默认1小时
   */
  set(key, value, ttl = this.defaultTTL) {
    const expiry = Date.now() + ttl * 1000;
    this.cache.set(key, { value, expiry });
  }

  /**
   * 获取缓存
   * @param {string} key - 缓存键名
   * @returns {any|null} 缓存值，如果缓存不存在或已过期则返回null
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) {
      return null;
    }

    // 检查缓存是否过期
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * 删除缓存
   * @param {string} key - 缓存键名
   * @returns {boolean} 删除是否成功
   */
  delete(key) {
    return this.cache.delete(key);
  }

  /**
   * 清除所有缓存
   */
  clear() {
    this.cache.clear();
  }

  /**
   * 检查缓存是否存在
   * @param {string} key - 缓存键名
   * @returns {boolean} 缓存是否存在且未过期
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * 获取缓存大小
   * @returns {number} 缓存数量
   */
  size() {
    return this.cache.size;
  }
}

// 创建单例实例
const cache = new Cache();

module.exports = cache;
