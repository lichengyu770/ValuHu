// 连接点功能初始化脚本
// 该脚本提供不修改index.html的情况下的连接点功能

// 检查全局变量是否已存在
if (!window.connectionPoint) {
  // 创建连接点命名空间
  window.connectionPoint = {
    version: '1.0.0',
    initialized: false,
    modules: {},
    connections: {},
    events: {},

    // 初始化连接点
    init: function () {
      if (this.initialized) return;

      console.log('连接点初始化中...');

      // 加载样式文件
      this.loadStyles();

      // 加载必要的依赖模块
      this.loadCoreModules();

      // 设置页面加载完成后的初始化
      this.setupPageLoadHandler();

      // 初始化事件系统
      this.initEventSystem();

      // 设置跨页面通信
      this.setupCrossPageCommunication();

      this.initialized = true;
      console.log('连接点初始化完成');

      // 触发初始化完成事件
      this.emit('initialized');
    },

    // 加载样式文件
    loadStyles: function () {
      // 检查样式是否已加载
      if (
        document.querySelector('link[href="/css/connection-point-styles.css"]')
      ) {
        console.log('连接点样式已加载');
        return;
      }

      // 创建样式链接
      const styleLink = document.createElement('link');
      styleLink.rel = 'stylesheet';
      styleLink.href = '/css/connection-point-styles.css';
      styleLink.id = 'connection-point-styles';

      // 添加到文档头部
      document.head.appendChild(styleLink);

      console.log('连接点样式加载完成');

      // 确保Font Awesome已加载（如果需要）
      this.ensureFontAwesomeLoaded();
    },

    // 确保Font Awesome已加载
    ensureFontAwesomeLoaded: function () {
      // 检查Font Awesome是否已加载
      if (
        !document.querySelector('link[href*="font-awesome"]') &&
        !document.querySelector('link[href*="fontawesome"]')
      ) {
        // 动态加载Font Awesome
        const faLink = document.createElement('link');
        faLink.rel = 'stylesheet';
        faLink.href =
          'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        faLink.integrity =
          'sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==';
        faLink.crossOrigin = 'anonymous';
        faLink.referrerPolicy = 'no-referrer';
        document.head.appendChild(faLink);
        console.log('Font Awesome 动态加载');
      }
    },

    // 加载核心模块
    loadCoreModules: function () {
      // 尝试加载已存在的管理器
      if (window.connectionManager) {
        this.modules.connectionManager = window.connectionManager;
      } else {
        // 动态加载连接管理器
        this.loadScript('/connection-manager.js', function () {
          if (window.connectionManager) {
            window.connectionPoint.modules.connectionManager =
              window.connectionManager;
          }
        });
      }

      // 尝试加载数据管理器
      if (window.dataManager) {
        this.modules.dataManager = window.dataManager;
      } else {
        // 动态加载数据管理器
        this.loadScript('/data-manager.js', function () {
          if (window.dataManager) {
            window.connectionPoint.modules.dataManager = window.dataManager;
          }
        });
      }

      // 尝试加载性能管理器
      if (window.performanceManager) {
        this.modules.performanceManager = window.performanceManager;
      } else {
        // 动态加载性能管理器
        this.loadScript('/performance-manager.js', function () {
          if (window.performanceManager) {
            window.connectionPoint.modules.performanceManager =
              window.performanceManager;
          }
        });
      }

      // 尝试加载错误处理器
      if (window.errorHandler) {
        this.modules.errorHandler = window.errorHandler;
      } else {
        // 动态加载错误处理器
        this.loadScript('/error-handler.js', function () {
          if (window.errorHandler) {
            window.connectionPoint.modules.errorHandler = window.errorHandler;
          }
        });
      }
    },

    // 动态加载脚本
    loadScript: function (src, callback) {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = function () {
        if (callback) callback();
      };
      script.onerror = function () {
        console.error('Failed to load script:', src);
        if (callback) callback();
      };
      document.head.appendChild(script);
    },

    // 设置页面加载完成处理器
    setupPageLoadHandler: function () {
      const self = this;

      // 检查页面是否已加载完成
      if (
        document.readyState === 'complete' ||
        document.readyState === 'interactive'
      ) {
        self.onPageReady();
      } else {
        // 监听DOMContentLoaded事件
        document.addEventListener('DOMContentLoaded', function () {
          self.onPageReady();
        });
      }

      // 监听页面完全加载事件
      window.addEventListener('load', function () {
        self.emit('pageLoaded');
      });
    },

    // 页面准备就绪处理
    onPageReady: function () {
      console.log('页面准备就绪，初始化连接点UI组件');

      // 创建连接点UI组件
      this.createConnectionUI();

      // 触发页面就绪事件
      this.emit('pageReady');
    },

    // 创建连接点UI组件
    createConnectionUI: function () {
      // 检查是否已经存在连接点UI
      if (document.getElementById('connection-point-container')) {
        console.warn('连接点UI已经存在');
        return;
      }

      // 创建连接点容器
      const container = document.createElement('div');
      container.id = 'connection-point-container';
      container.className = 'connection-point';

      // 创建主按钮
      const mainButton = document.createElement('button');
      mainButton.id = 'connection-main-btn';
      mainButton.className = 'connection-point-btn';
      mainButton.innerHTML = '<i class="fas fa-exchange-alt"></i>';
      mainButton.title = '多页连接点';

      // 创建连接面板
      const panel = document.createElement('div');
      panel.id = 'connection-panel';
      panel.className = 'connection-panel';

      // 填充面板内容
      panel.innerHTML = `
                <div class="panel-header">
                    <h3 class="panel-title">页面连接中心</h3>
                    <button class="close-btn" id="close-panel-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="page-tabs">
                    <button class="tab-btn active" data-tab="pages">已打开页面</button>
                    <button class="tab-btn" data-tab="sync">数据同步</button>
                </div>
                
                <div class="tab-content">
                    <div class="pages-list" id="pages-list">
                        <!-- 页面列表将动态生成 -->
                        <div class="loading-spinner"></div>
                    </div>
                    
                    <div class="sync-panel" id="sync-panel">
                        <!-- 数据同步面板将动态生成 -->
                        <div class="loading-spinner"></div>
                    </div>
                </div>
            `;

      // 组装连接点
      container.appendChild(mainButton);

      // 将连接点添加到页面
      document.body.appendChild(container);
      document.body.appendChild(panel);

      // 保存元素引用
      this.ui = {
        elements: {
          container: container,
          mainButton: mainButton,
          panel: panel,
          closeButton: document.getElementById('close-panel-btn'),
          tabs: document.querySelectorAll('.tab-btn'),
          pagesList: document.getElementById('pages-list'),
          syncPanel: document.getElementById('sync-panel'),
        },
      };

      // 设置面板切换功能
      this.setupPanelToggle();

      console.log('连接点UI创建完成');
    },

    // 设置面板切换功能
    setupPanelToggle: function () {
      if (!this.ui || !this.ui.elements) return;

      const mainButton = this.ui.elements.mainButton;
      const panel = this.ui.elements.panel;
      const closeButton = this.ui.elements.closeButton;
      const tabs = this.ui.elements.tabs;

      // 主按钮点击事件
      mainButton.addEventListener('click', () => {
        panel.classList.toggle('visible');
        // 初始化页面列表
        if (panel.classList.contains('visible')) {
          this.updatePageList();
        }
      });

      // 关闭按钮点击事件
      closeButton.addEventListener('click', () => {
        panel.classList.remove('visible');
      });

      // 选项卡切换
      tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
          // 移除所有选项卡的active状态
          tabs.forEach((t) => t.classList.remove('active'));
          // 添加当前选项卡的active状态
          tab.classList.add('active');

          const tabId = tab.dataset.tab;
          this.switchTab(tabId);
        });
      });

      // 点击面板外部关闭面板
      document.addEventListener('click', (event) => {
        if (
          panel.classList.contains('visible') &&
          !panel.contains(event.target) &&
          !mainButton.contains(event.target)
        ) {
          panel.classList.remove('visible');
        }
      });
    },

    // 切换选项卡
    switchTab: function (tabId) {
      if (!this.ui || !this.ui.elements) return;

      const pagesList = this.ui.elements.pagesList;
      const syncPanel = this.ui.elements.syncPanel;

      // 隐藏所有面板
      pagesList.style.display = 'none';
      syncPanel.style.display = 'none';

      // 显示选中的面板
      if (tabId === 'pages') {
        pagesList.style.display = 'block';
        this.updatePageList();
      } else if (tabId === 'sync') {
        syncPanel.style.display = 'block';
        this.updateSyncPanel();
      }
    },

    // 更新页面列表
    updatePageList: function () {
      if (!this.ui || !this.ui.elements || !this.ui.elements.pagesList) return;

      const pagesList = this.ui.elements.pagesList;

      // 清空列表
      pagesList.innerHTML = '';

      // 获取当前页面信息
      const currentPage = this.getCurrentPageInfo();

      // 添加当前页面
      const currentItem = this.createPageItem(currentPage, true);
      pagesList.appendChild(currentItem);

      // 模拟其他页面
      // 实际项目中，这里应该显示通过BroadcastChannel或其他方式获取的其他页面信息
      const mockPages = this.getMockPages();
      mockPages.forEach((page) => {
        const pageItem = this.createPageItem(page, false);
        pagesList.appendChild(pageItem);
      });
    },

    // 创建页面项
    createPageItem: function (pageInfo, isActive) {
      const item = document.createElement('div');
      item.className = 'page-item' + (isActive ? ' active-page' : '');

      // 提取页面名称
      let pageName = pageInfo.title || '未命名页面';
      const pathParts = pageInfo.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      if (fileName && fileName.endsWith('.html')) {
        pageName = fileName.replace('.html', '').replace(/-/g, ' ');
        // 首字母大写
        pageName = pageName.charAt(0).toUpperCase() + pageName.slice(1);
      }

      // 获取页面图标
      const icon = this.getPageIcon(pageInfo.pathname);

      item.innerHTML = `
                <div class="page-info">
                    <div class="page-icon">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="page-details">
                        <h4>${pageName}</h4>
                        <p>${pageInfo.pathname}</p>
                    </div>
                </div>
                <div class="page-status ${isActive ? '' : 'inactive'}"></div>
            `;

      // 添加点击事件（如果不是当前页面）
      if (!isActive) {
        item.addEventListener('click', () => {
          this.navigate(pageInfo.pathname);
        });
      }

      return item;
    },

    // 获取页面图标
    getPageIcon: function (pathname) {
      const iconMap = {
        '/index.html': 'fa-home',
        '/about-us.html': 'fa-info-circle',
        '/contact.html': 'fa-envelope',
        '/services.html': 'fa-concierge-bell',
        '/products.html': 'fa-box',
        '/faq.html': 'fa-question-circle',
        '/privacy.html': 'fa-shield-alt',
        '/terms.html': 'fa-file-contract',
      };

      // 移除末尾斜杠
      const normalizedPath = pathname.replace(/\/$/, '') || '/index.html';
      return iconMap[normalizedPath] || 'fa-file-alt';
    },

    // 获取模拟页面数据
    getMockPages: function () {
      const currentPath = window.location.pathname;
      const mockPages = [
        { pathname: '/index.html', title: '首页' },
        { pathname: '/about-us.html', title: '关于我们' },
        { pathname: '/contact.html', title: '联系我们' },
        { pathname: '/services.html', title: '我们的服务' },
      ];

      // 过滤掉当前页面
      return mockPages.filter((page) => page.pathname !== currentPath);
    },

    // 更新同步面板
    updateSyncPanel: function () {
      if (!this.ui || !this.ui.elements || !this.ui.elements.syncPanel) return;

      const syncPanel = this.ui.elements.syncPanel;

      // 清空面板
      syncPanel.innerHTML = '';

      // 创建同步项
      const syncItems = [
        {
          id: 'userInfo',
          name: '用户信息',
          description: '当前登录用户数据',
          synchronized: true,
        },
        {
          id: 'preferences',
          name: '用户偏好设置',
          description: '界面配置和个性化选项',
          synchronized: true,
        },
        {
          id: 'sessionData',
          name: '会话数据',
          description: '当前浏览会话信息',
          synchronized: false,
        },
      ];

      // 添加同步项
      syncItems.forEach((item) => {
        const syncItem = this.createSyncItem(item);
        syncPanel.appendChild(syncItem);
      });
    },

    // 创建同步项
    createSyncItem: function (item) {
      const syncItem = document.createElement('div');
      syncItem.className = 'sync-item';

      syncItem.innerHTML = `
                <div class="sync-info">
                    <h4>${item.name}</h4>
                    <p>${item.description}</p>
                </div>
                <button class="sync-action ${item.synchronized ? 'secondary' : ''}" data-id="${item.id}">
                    ${item.synchronized ? '已同步' : '立即同步'}
                </button>
            `;

      // 添加点击事件
      const actionBtn = syncItem.querySelector('.sync-action');
      actionBtn.addEventListener('click', () => {
        if (!item.synchronized) {
          // 模拟同步操作
          this.simulateSync(item.id, actionBtn);
        }
      });

      return syncItem;
    },

    // 模拟同步操作
    simulateSync: function (itemId, button) {
      // 显示加载状态
      const originalText = button.textContent;
      button.disabled = true;
      button.innerHTML =
        '<div class="loading-spinner" style="width: 14px; height: 14px; margin: 0 auto;"></div>';

      // 模拟同步延迟
      setTimeout(() => {
        // 更新按钮状态
        button.textContent = '已同步';
        button.className = 'sync-action secondary';
        button.disabled = false;

        // 同步数据
        this.syncData(itemId, {
          synced: true,
          timestamp: Date.now(),
          source: window.location.href,
        });

        console.log(`数据项 ${itemId} 同步完成`);
      }, 1500);
    },

    // 初始化事件系统
    initEventSystem: function () {
      this.events = {};
    },

    // 注册事件监听器
    on: function (eventName, callback) {
      if (!this.events[eventName]) {
        this.events[eventName] = [];
      }
      this.events[eventName].push(callback);

      // 如果是initialized事件且已经初始化完成，立即执行回调
      if (eventName === 'initialized' && this.initialized) {
        callback();
      }

      return this;
    },

    // 移除事件监听器
    off: function (eventName, callback) {
      if (!this.events[eventName]) return;

      if (!callback) {
        // 移除所有该事件的监听器
        delete this.events[eventName];
      } else {
        // 移除特定的监听器
        this.events[eventName] = this.events[eventName].filter(
          (cb) => cb !== callback
        );
      }

      return this;
    },

    // 触发事件
    emit: function (eventName, ...args) {
      if (!this.events[eventName]) return;

      this.events[eventName].forEach((callback) => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event handler for ${eventName}:`, error);
        }
      });

      return this;
    },

    // 设置跨页面通信
    setupCrossPageCommunication: function () {
      // 检查是否支持BroadcastChannel
      if (window.BroadcastChannel) {
        this.broadcastChannel = new BroadcastChannel(
          'connection-point-channel'
        );

        // 监听消息
        this.broadcastChannel.onmessage = function (event) {
          const { type, data } = event.data;
          window.connectionPoint.handleCrossPageMessage(type, data);
        };
      } else {
        // 降级方案：使用localStorage
        this.setupLocalStorageCommunication();
      }
    },

    // 设置localStorage通信
    setupLocalStorageCommunication: function () {
      const self = this;

      window.addEventListener('storage', function (event) {
        if (event.key && event.key.startsWith('connection-point-msg-')) {
          try {
            const message = JSON.parse(event.newValue);
            if (message) {
              const { type, data } = message;
              self.handleCrossPageMessage(type, data);
            }
          } catch (error) {
            console.error('Error parsing localStorage message:', error);
          }
        }
      });
    },

    // 跨页面通信消息处理
    handleCrossPageMessage: function (type, data) {
      try {
        // 确保数据完整性检查
        if (!type) {
          console.warn('收到不完整的跨页面消息，缺少type字段');
          return;
        }

        const eventName =
          'crossPage' + type.charAt(0).toUpperCase() + type.slice(1);

        // 触发事件
        this.emit(eventName, data || {});

        // 记录消息日志（仅在开发模式）
        if (this.debugMode) {
          console.log(`收到跨页面消息: ${type}`, data);
        }

        // 特殊消息类型处理
        switch (type) {
          case 'dataUpdate':
            if (data) {
              this.handleDataUpdate(data);
            }
            break;
          case 'navigation':
            if (data) {
              this.handleNavigation(data);
            }
            break;
          case 'ping':
            this.handlePing(data || {});
            break;
          case 'getPages':
            this.handleGetPagesRequest();
            break;
          case 'pagesList':
            if (data && data.pages) {
              this.updatePagesList(data.pages);
            }
            break;
          default:
            // 触发自定义消息事件
            this.emit('crossPageMessage', { type, data });
        }
      } catch (error) {
        console.error('处理跨页面消息时出错:', error);
        // 触发错误事件，允许外部处理
        this.emit('error', {
          type: 'crossPageMessageError',
          error: error.message,
        });
      }
    },

    // 处理数据更新
    handleDataUpdate: function (data) {
      try {
        if (!data || !data.key || data.value === undefined) {
          console.warn('收到不完整的数据更新消息');
          return;
        }

        // 检查数据是否发生变化，避免不必要的更新
        let needsUpdate = true;
        if (
          this.modules.dataManager &&
          typeof this.modules.dataManager.get === 'function'
        ) {
          const currentValue = JSON.stringify(
            this.modules.dataManager.get(data.key)
          );
          const newValue = JSON.stringify(data.value);
          needsUpdate = currentValue !== newValue;
        }

        if (needsUpdate) {
          // 如果有数据管理器，通知其更新数据
          if (
            this.modules.dataManager &&
            typeof this.modules.dataManager.syncUpdate === 'function'
          ) {
            this.modules.dataManager.syncUpdate(data.key, data.value);
          }

          // 触发数据更新事件
          this.emit('dataUpdated', {
            key: data.key,
            value: data.value,
            source: 'remote',
            updatedAt: data.updatedAt,
          });

          // 记录更新日志
          if (this.debugMode) {
            console.log(`收到数据更新: ${data.key}`, data.value);
          }
        }
      } catch (error) {
        console.error('处理数据更新时出错:', error);
        this.emit('error', {
          type: 'handleDataUpdateError',
          key: data && data.key,
          error: error.message,
        });
      }
    },

    // 处理导航请求
    handleNavigation: function (data) {
      const { url, replace = false } = data;
      if (replace) {
        window.location.replace(url);
      } else {
        window.location.href = url;
      }
    },

    // 处理ping请求
    handlePing: function (data) {
      // 回复pong
      this.sendCrossPageMessage('pong', { ...data, timestamp: Date.now() });
    },

    // 发送跨页面消息
    sendCrossPageMessage: function (type, data) {
      try {
        const message = {
          type,
          data: data || {},
          source: window.location.href,
          timestamp: Date.now(),
          pageTitle: document.title,
          pageUrl: window.location.href,
        };

        // 记录发送消息日志
        if (this.debugMode) {
          console.log(`发送跨页面消息: ${type}`, data);
        }

        // 优先使用BroadcastChannel
        if (this.broadcastChannel) {
          this.broadcastChannel.postMessage(message);
        } else if (window.localStorage) {
          // 使用localStorage作为降级方案
          const key = 'connection-point-msg-' + Date.now();
          localStorage.setItem(key, JSON.stringify(message));
          // 立即删除，避免多次触发
          setTimeout(() => {
            try {
              localStorage.removeItem(key);
            } catch (cleanupError) {
              // 忽略清理错误，不会影响主要功能
            }
          }, 100);
        } else {
          console.warn('浏览器不支持localStorage，无法进行跨页面通信');
          return null;
        }

        return message.timestamp;
      } catch (error) {
        console.error('发送跨页面消息时出错:', error);
        this.emit('error', { type: 'sendMessageError', error: error.message });
        return null;
      }
    },

    // 连接到其他页面
    connect: function (targetPage, options = {}) {
      const connectionId = targetPage + '-' + Date.now();

      this.connections[connectionId] = {
        targetPage,
        options,
        connected: false,
        connectTime: Date.now(),
      };

      // 发送连接请求
      this.sendCrossPageMessage('connectRequest', {
        connectionId,
        sourcePage: window.location.href,
        options,
      });

      return connectionId;
    },

    // 断开连接
    disconnect: function (connectionId) {
      if (this.connections[connectionId]) {
        // 发送断开连接通知
        this.sendCrossPageMessage('disconnect', { connectionId });

        // 删除连接记录
        delete this.connections[connectionId];
      }
    },

    // 向特定连接发送消息
    sendMessage: function (connectionId, message) {
      if (this.connections[connectionId]) {
        this.sendCrossPageMessage('directMessage', {
          connectionId,
          message,
        });
      } else {
        console.error('Connection not found:', connectionId);
      }
    },

    // 获取连接状态
    getConnectionStatus: function (connectionId) {
      return this.connections[connectionId] || null;
    },

    // 同步数据到所有页面
    syncData: function (key, value) {
      try {
        // 验证参数
        if (!key) {
          console.warn('同步数据时key不能为空');
          return false;
        }

        // 深拷贝值以避免引用问题
        const safeValue = JSON.parse(JSON.stringify(value));

        // 如果有数据管理器，更新本地数据
        if (
          this.modules.dataManager &&
          typeof this.modules.dataManager.set === 'function'
        ) {
          this.modules.dataManager.set(key, safeValue);
        }

        // 通知其他页面
        this.sendCrossPageMessage('dataUpdate', {
          key: key,
          value: safeValue,
          updatedAt: new Date().toISOString(),
        });

        // 触发数据更新事件
        this.emit('dataUpdated', {
          key: key,
          value: safeValue,
          source: 'local',
        });

        // 记录同步日志
        if (this.debugMode) {
          console.log(`数据已同步: ${key}`, value);
        }

        return true;
      } catch (error) {
        console.error('同步数据时出错:', error);
        this.emit('error', {
          type: 'syncDataError',
          key: key,
          error: error.message,
        });
        return false;
      }
    },

    // 导航到指定页面
    navigate: function (url, replace = false) {
      if (replace) {
        window.location.replace(url);
      } else {
        window.location.href = url;
      }
    },

    // 获取当前页面信息
    getCurrentPageInfo: function () {
      return {
        url: window.location.href,
        title: document.title,
        pathname: window.location.pathname,
        hash: window.location.hash,
        search: window.location.search,
        timestamp: Date.now(),
      };
    },

    // 处理获取页面列表请求
    handleGetPagesRequest: function () {
      try {
        const currentPage = this.getCurrentPageInfo();
        this.sendCrossPageMessage('pagesList', {
          pages: [currentPage],
        });
      } catch (error) {
        console.error('处理获取页面列表请求时出错:', error);
      }
    },

    // 更新页面列表
    updatePagesList: function (pages) {
      try {
        if (Array.isArray(pages)) {
          // 合并去重，保留最新信息
          const pageMap = new Map();

          // 添加本地已知页面
          if (this.connectedPages) {
            this.connectedPages.forEach((page) => {
              pageMap.set(page.url, page);
            });
          }

          // 添加新页面信息
          pages.forEach((page) => {
            pageMap.set(page.url, { ...page, lastSeen: Date.now() });
          });

          // 移除超时页面（超过30秒未更新）
          const now = Date.now();
          const activePages = Array.from(pageMap.values()).filter(
            (page) => now - page.lastSeen < 30000
          );

          // 更新连接页面列表
          this.connectedPages = activePages;

          // 触发页面列表更新事件
          this.emit('pagesListUpdated', { pages: activePages });

          // 更新UI中的页面列表
          if (this.ui && this.ui.elements && this.ui.elements.pagesList) {
            this.updatePageList();
          }
        }
      } catch (error) {
        console.error('更新页面列表时出错:', error);
      }
    },

    // 获取已连接页面列表
    getConnectedPages: function () {
      return this.connectedPages || [];
    },

    // 检查连接点是否可用
    isAvailable: function () {
      return this.initialized;
    },

    // 获取连接点版本
    getVersion: function () {
      return this.version;
    },
  };

  // 自动初始化连接点
  window.addEventListener('DOMContentLoaded', function () {
    window.connectionPoint.init();
  });

  // 如果DOM已经加载完成，立即初始化
  if (
    document.readyState === 'complete' ||
    document.readyState === 'interactive'
  ) {
    setTimeout(function () {
      window.connectionPoint.init();
    }, 0);
  }
}

// 导出连接点对象到全局命名空间
window.connectionPoint = window.connectionPoint || {};
