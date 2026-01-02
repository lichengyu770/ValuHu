// 数据管理器 - 数智估价核心引擎

/**
 * 数据管理器类
 * 负责页面间的数据共享、状态同步和事件通知
 */
class DataManager {
  constructor() {
    // 数据存储
    this.dataStore = new Map();
    // 事件监听器
    this.eventListeners = new Map();
    // 持久化配置
    this.persistentKeys = new Set();
    // 初始化会话数据
    this.sessionId = this.generateSessionId();
    // 批量更新状态
    this.batchUpdateMode = false;
    this.pendingUpdates = new Map();
    // 初始化
    this.initialize();
  }

  /**
   * 初始化数据管理器
   */
  initialize() {
    this.loadPersistedData();
    this.setupCrossPageCommunication();
    this.registerPageUnloadHandler();
  }

  /**
   * 生成会话ID
   * @returns {string} 会话ID
   */
  generateSessionId() {
    let sessionId = sessionStorage.getItem('dataManagerSessionId');
    if (!sessionId) {
      sessionId =
        'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('dataManagerSessionId', sessionId);
    }
    return sessionId;
  }

  /**
   * 设置数据项
   * @param {string} key 数据键名
   * @param {any} value 数据值
   * @param {object} options 配置选项
   */
  set(key, value, options = {}) {
    const { persist = false, validate = null, silent = false } = options;

    // 数据验证
    if (validate && typeof validate === 'function') {
      const validation = validate(value);
      if (!validation.valid) {
        console.error(`数据验证失败 [${key}]:`, validation.error);
        return false;
      }
    }

    const oldValue = this.dataStore.get(key);

    // 检测值是否变化
    const isChanged = !this.deepEqual(oldValue, value);

    if (isChanged) {
      // 存储数据
      this.dataStore.set(key, value);

      // 设置持久化
      if (persist) {
        this.persistentKeys.add(key);
        this.persistData(key, value);
      } else if (this.persistentKeys.has(key)) {
        this.persistentKeys.delete(key);
        this.removePersistedData(key);
      }

      // 处理批量更新
      if (this.batchUpdateMode) {
        this.pendingUpdates.set(key, { oldValue, newValue: value });
        return true;
      }

      // 触发变更事件
      if (!silent) {
        this.emit('change', { key, oldValue, newValue: value });
        this.emit(`change:${key}`, { oldValue, newValue: value });
      }

      // 通知其他页面
      if (!silent) {
        this.notifyOtherPages('dataUpdate', {
          key,
          value,
          sessionId: this.sessionId,
        });
      }
    }

    return true;
  }

  /**
   * 获取数据项
   * @param {string} key 数据键名
   * @param {any} defaultValue 默认值
   * @returns {any} 数据值
   */
  get(key, defaultValue = undefined) {
    return this.dataStore.has(key) ? this.dataStore.get(key) : defaultValue;
  }

  /**
   * 检查数据项是否存在
   * @param {string} key 数据键名
   * @returns {boolean} 是否存在
   */
  has(key) {
    return this.dataStore.has(key);
  }

  /**
   * 删除数据项
   * @param {string} key 数据键名
   * @param {boolean} silent 是否静默删除
   */
  remove(key, silent = false) {
    if (this.dataStore.has(key)) {
      const oldValue = this.dataStore.get(key);
      this.dataStore.delete(key);

      // 移除持久化数据
      if (this.persistentKeys.has(key)) {
        this.persistentKeys.delete(key);
        this.removePersistedData(key);
      }

      // 处理批量更新
      if (this.batchUpdateMode) {
        this.pendingUpdates.set(key, {
          oldValue,
          newValue: undefined,
          isDelete: true,
        });
        return true;
      }

      // 触发移除事件
      if (!silent) {
        this.emit('remove', { key, oldValue });
        this.emit(`remove:${key}`, { oldValue });
      }

      // 通知其他页面
      if (!silent) {
        this.notifyOtherPages('dataRemove', { key, sessionId: this.sessionId });
      }

      return true;
    }
    return false;
  }

  /**
   * 清除所有数据
   * @param {boolean} includePersistent 是否包含持久化数据
   */
  clear(includePersistent = false) {
    const allKeys = Array.from(this.dataStore.keys());

    // 先保存需要保留的持久化数据键
    const persistentKeysToKeep = includePersistent
      ? []
      : Array.from(this.persistentKeys);

    // 清除所有数据
    this.dataStore.clear();

    // 如果不包含持久化数据，则重新加载
    if (!includePersistent) {
      persistentKeysToKeep.forEach((key) => {
        const value = this.loadPersistedDataItem(key);
        if (value !== null) {
          this.dataStore.set(key, value);
        }
      });
    } else {
      // 清除所有持久化数据
      this.clearAllPersistedData();
      this.persistentKeys.clear();
    }

    // 触发清除事件
    this.emit('clear', {
      includePersistent,
      removedKeys: allKeys.filter((key) => !persistentKeysToKeep.includes(key)),
    });

    // 通知其他页面
    this.notifyOtherPages('dataClear', {
      includePersistent,
      sessionId: this.sessionId,
    });
  }

  /**
   * 批量更新数据
   * @param {function} callback 更新回调
   */
  batchUpdate(callback) {
    if (typeof callback !== 'function') return;

    this.batchUpdateMode = true;
    try {
      callback();
    } catch (error) {
      console.error('批量更新失败:', error);
    } finally {
      this.batchUpdateMode = false;
      this.processPendingUpdates();
    }
  }

  /**
   * 处理挂起的批量更新
   */
  processPendingUpdates() {
    if (this.pendingUpdates.size === 0) return;

    const updates = Array.from(this.pendingUpdates.entries());
    this.pendingUpdates.clear();

    // 触发批量更新事件
    this.emit('batchUpdate', { updates });

    // 通知其他页面
    this.notifyOtherPages('dataBatchUpdate', {
      updates,
      sessionId: this.sessionId,
    });
  }

  /**
   * 监听数据变更事件
   * @param {string} event 事件名称
   * @param {function} listener 监听器
   */
  on(event, listener) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(listener);
  }

  /**
   * 移除事件监听器
   * @param {string} event 事件名称
   * @param {function} listener 监听器
   */
  off(event, listener) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).delete(listener);
      if (this.eventListeners.get(event).size === 0) {
        this.eventListeners.delete(event);
      }
    }
  }

  /**
   * 触发事件
   * @param {string} event 事件名称
   * @param {any} data 事件数据
   */
  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          console.error(`事件监听器执行失败 [${event}]:`, error);
        }
      });
    }
  }

  /**
   * 持久化数据
   * @param {string} key 数据键名
   * @param {any} value 数据值
   */
  persistData(key, value) {
    try {
      const serialized = this.serialize(value);
      localStorage.setItem(`data_${key}`, serialized);
    } catch (error) {
      console.warn(`数据持久化失败 [${key}]:`, error);
    }
  }

  /**
   * 加载持久化数据
   */
  loadPersistedData() {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('data_')) {
          const actualKey = key.substring(5);
          const value = this.loadPersistedDataItem(actualKey);
          if (value !== null) {
            this.dataStore.set(actualKey, value);
            this.persistentKeys.add(actualKey);
          }
        }
      }
    } catch (error) {
      console.warn('加载持久化数据失败:', error);
    }
  }

  /**
   * 加载单个持久化数据项
   * @param {string} key 数据键名
   * @returns {any} 数据值
   */
  loadPersistedDataItem(key) {
    try {
      const serialized = localStorage.getItem(`data_${key}`);
      return serialized !== null ? this.deserialize(serialized) : null;
    } catch (error) {
      console.warn(`加载持久化数据项失败 [${key}]:`, error);
      return null;
    }
  }

  /**
   * 移除持久化数据
   * @param {string} key 数据键名
   */
  removePersistedData(key) {
    try {
      localStorage.removeItem(`data_${key}`);
    } catch (error) {
      console.warn(`移除持久化数据失败 [${key}]:`, error);
    }
  }

  /**
   * 清除所有持久化数据
   */
  clearAllPersistedData() {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('data_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.warn('清除所有持久化数据失败:', error);
    }
  }

  /**
   * 设置跨页面通信
   */
  setupCrossPageCommunication() {
    // 使用 BroadcastChannel 或 localStorage 作为后备
    if (window.BroadcastChannel) {
      this.setupBroadcastChannel();
    } else {
      this.setupLocalStorageCommunication();
    }
  }

  /**
   * 设置 BroadcastChannel 通信
   */
  setupBroadcastChannel() {
    try {
      this.broadcastChannel = new BroadcastChannel('dataManagerChannel');
      this.broadcastChannel.onmessage = (event) => {
        const { type, data, sessionId } = event.data;

        // 忽略自己发送的消息
        if (sessionId === this.sessionId) return;

        this.handleCrossPageMessage(type, data);
      };
    } catch (error) {
      console.warn('设置 BroadcastChannel 失败，回退到 localStorage:', error);
      this.setupLocalStorageCommunication();
    }
  }

  /**
   * 设置 localStorage 通信
   */
  setupLocalStorageCommunication() {
    window.addEventListener('storage', (event) => {
      if (event.key && event.key.startsWith('dataManager_')) {
        try {
          const message = this.deserialize(event.newValue);
          if (message && message.sessionId !== this.sessionId) {
            this.handleCrossPageMessage(message.type, message.data);
          }
        } catch (error) {
          console.warn('解析跨页面消息失败:', error);
        }
      }
    });
  }

  /**
   * 通知其他页面
   * @param {string} type 消息类型
   * @param {any} data 消息数据
   */
  notifyOtherPages(type, data) {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type,
        data,
        sessionId: this.sessionId,
      });
    } else {
      // 使用 localStorage 作为后备
      const messageKey = `dataManager_${type}_${Date.now()}`;
      const message = { type, data, sessionId: this.sessionId };
      try {
        localStorage.setItem(messageKey, this.serialize(message));
        // 立即删除以避免重复处理
        setTimeout(() => localStorage.removeItem(messageKey), 100);
      } catch (error) {
        console.warn('发送跨页面消息失败:', error);
      }
    }
  }

  /**
   * 处理跨页面消息
   * @param {string} type 消息类型
   * @param {any} data 消息数据
   */
  handleCrossPageMessage(type, data) {
    switch (type) {
      case 'dataUpdate':
        this.syncDataUpdate(data.key, data.value);
        break;
      case 'dataRemove':
        this.syncDataRemove(data.key);
        break;
      case 'dataClear':
        this.syncDataClear(data.includePersistent);
        break;
      case 'dataBatchUpdate':
        this.syncDataBatchUpdate(data.updates);
        break;
      case 'ping':
        this.handlePing(data);
        break;
      default:
        console.warn(`未知的跨页面消息类型: ${type}`);
    }
  }

  /**
   * 同步数据更新
   * @param {string} key 数据键名
   * @param {any} value 数据值
   */
  syncDataUpdate(key, value) {
    const oldValue = this.dataStore.get(key);
    this.dataStore.set(key, value);
    this.emit('sync', { key, oldValue, newValue: value });
    this.emit(`sync:${key}`, { oldValue, newValue: value });
  }

  /**
   * 同步数据移除
   * @param {string} key 数据键名
   */
  syncDataRemove(key) {
    if (this.dataStore.has(key)) {
      const oldValue = this.dataStore.get(key);
      this.dataStore.delete(key);
      if (this.persistentKeys.has(key)) {
        this.persistentKeys.delete(key);
      }
      this.emit('syncRemove', { key, oldValue });
      this.emit(`syncRemove:${key}`, { oldValue });
    }
  }

  /**
   * 同步数据清除
   * @param {boolean} includePersistent 是否包含持久化数据
   */
  syncDataClear(includePersistent) {
    this.clear(includePersistent);
  }

  /**
   * 同步批量更新
   * @param {Array} updates 更新数组
   */
  syncDataBatchUpdate(updates) {
    updates.forEach(([key, update]) => {
      if (update.isDelete) {
        this.syncDataRemove(key);
      } else {
        this.syncDataUpdate(key, update.newValue);
      }
    });
    this.emit('syncBatchUpdate', { updates });
  }

  /**
   * 处理 ping 消息
   * @param {object} data 消息数据
   */
  handlePing(data) {
    this.notifyOtherPages('pong', {
      senderId: data.senderId,
      timestamp: Date.now(),
      dataStoreSize: this.dataStore.size,
    });
  }

  /**
   * 注册页面卸载处理器
   */
  registerPageUnloadHandler() {
    window.addEventListener('beforeunload', () => {
      this.notifyOtherPages('pageUnload', {
        sessionId: this.sessionId,
        timestamp: Date.now(),
      });
    });
  }

  /**
   * 序列化数据
   * @param {any} data 待序列化数据
   * @returns {string} 序列化后的字符串
   */
  serialize(data) {
    return JSON.stringify(data, (key, value) => {
      // 处理无法序列化的类型
      if (value instanceof Date) {
        return { $date: value.toISOString() };
      }
      if (value instanceof Map) {
        return { $map: Array.from(value.entries()) };
      }
      if (value instanceof Set) {
        return { $set: Array.from(value) };
      }
      if (
        typeof value === 'function' ||
        value instanceof RegExp ||
        value instanceof Error
      ) {
        console.warn('跳过无法序列化的数据类型:', value);
        return undefined;
      }
      return value;
    });
  }

  /**
   * 反序列化数据
   * @param {string} serialized 序列化后的字符串
   * @returns {any} 反序列化后的数据
   */
  deserialize(serialized) {
    return JSON.parse(serialized, (key, value) => {
      if (value && typeof value === 'object') {
        if (value.$date) {
          return new Date(value.$date);
        }
        if (value.$map) {
          return new Map(value.$map);
        }
        if (value.$set) {
          return new Set(value.$set);
        }
      }
      return value;
    });
  }

  /**
   * 深度比较两个值是否相等
   * @param {any} a 第一个值
   * @param {any} b 第二个值
   * @returns {boolean} 是否相等
   */
  deepEqual(a, b) {
    if (a === b) return true;

    if (
      a == null ||
      b == null ||
      typeof a !== 'object' ||
      typeof b !== 'object'
    ) {
      return false;
    }

    if (a.constructor !== b.constructor) return false;

    if (a instanceof Date) return a.getTime() === b.getTime();
    if (a instanceof Map) {
      if (a.size !== b.size) return false;
      for (const [key, value] of a) {
        if (!b.has(key) || !this.deepEqual(value, b.get(key))) return false;
      }
      return true;
    }
    if (a instanceof Set) {
      if (a.size !== b.size) return false;
      for (const value of a) {
        if (!b.has(value)) return false;
      }
      return true;
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (!keysB.includes(key) || !this.deepEqual(a[key], b[key])) {
        return false;
      }
    }

    return true;
  }

  /**
   * 创建数据访问代理
   * @param {string} namespace 命名空间
   * @returns {Proxy} 数据访问代理
   */
  createDataProxy(namespace) {
    const baseKey = namespace ? `${namespace}.` : '';

    return new Proxy(
      {},
      {
        get: (target, prop) => {
          if (typeof prop === 'symbol' || prop === 'constructor') return;
          return this.get(`${baseKey}${prop}`);
        },
        set: (target, prop, value) => {
          if (typeof prop === 'symbol' || prop === 'constructor') return false;
          this.set(`${baseKey}${prop}`, value);
          return true;
        },
        has: (target, prop) => {
          if (typeof prop === 'symbol' || prop === 'constructor') return false;
          return this.has(`${baseKey}${prop}`);
        },
        deleteProperty: (target, prop) => {
          if (typeof prop === 'symbol' || prop === 'constructor') return false;
          return this.remove(`${baseKey}${prop}`);
        },
      }
    );
  }

  /**
   * 创建数据绑定
   * @param {HTMLElement} element DOM元素
   * @param {string} dataKey 数据键名
   * @param {object} options 配置选项
   */
  bindToElement(element, dataKey, options = {}) {
    const { attribute = 'value', event = 'input', converter = null } = options;

    // 更新元素
    const updateElement = (value) => {
      if (converter && converter.toElement) {
        value = converter.toElement(value);
      }
      element[attribute] = value;
    };

    // 初始更新
    updateElement(this.get(dataKey));

    // 监听数据变化
    this.on(`change:${dataKey}`, ({ newValue }) => {
      updateElement(newValue);
    });

    // 监听元素变化
    element.addEventListener(event, () => {
      let value = element[attribute];
      if (converter && converter.fromElement) {
        value = converter.fromElement(value);
      }
      this.set(dataKey, value);
    });

    // 返回解绑函数
    return () => {
      this.off(`change:${dataKey}`);
      element.removeEventListener(event);
    };
  }

  /**
   * 导出数据快照
   * @returns {object} 数据快照
   */
  exportSnapshot() {
    const snapshot = {};
    this.dataStore.forEach((value, key) => {
      snapshot[key] = JSON.parse(this.serialize(value));
    });
    return snapshot;
  }

  /**
   * 导入数据快照
   * @param {object} snapshot 数据快照
   * @param {boolean} merge 是否合并而不是覆盖
   */
  importSnapshot(snapshot, merge = false) {
    if (!merge) {
      this.clear(true);
    }

    Object.entries(snapshot).forEach(([key, value]) => {
      this.set(key, value, { silent: true });
    });

    // 批量触发变更事件
    this.emit('snapshotLoaded', { snapshot, merge });
  }

  /**
   * 注册到连接管理器
   * @param {object} connectionManager 连接管理器实例
   */
  registerToConnectionManager(connectionManager) {
    if (
      !connectionManager ||
      typeof connectionManager.registerFeature !== 'function'
    ) {
      console.warn('连接管理器未提供或不支持功能注册');
      return;
    }

    // 注册数据功能
    connectionManager.registerFeature('data', {
      set: this.set.bind(this),
      get: this.get.bind(this),
      has: this.has.bind(this),
      remove: this.remove.bind(this),
      clear: this.clear.bind(this),
      batchUpdate: this.batchUpdate.bind(this),
      on: this.on.bind(this),
      off: this.off.bind(this),
      createProxy: this.createDataProxy.bind(this),
      bindToElement: this.bindToElement.bind(this),
      exportSnapshot: this.exportSnapshot.bind(this),
      importSnapshot: this.importSnapshot.bind(this),
    });

    console.log('数据管理器已成功注册到连接管理器');
  }
}

// 创建数据管理器实例
const dataManager = new DataManager();

// 自动注册到连接管理器（如果存在）
if (window.ConnectionManager) {
  dataManager.registerToConnectionManager(window.ConnectionManager);
} else {
  // 监听连接管理器加载
  window.addEventListener('connection.initialized', (event) => {
    if (window.ConnectionManager) {
      dataManager.registerToConnectionManager(window.ConnectionManager);
    }
  });
}

// 为了兼容不使用ES模块的环境
if (typeof window !== 'undefined') {
  window.DataManager = dataManager;
}
