// 连接点管理器 - 实现多页面应用的核心功能共享

/**
 * 连接点管理器类
 * 提供页面间的功能共享、初始化和通信机制
 */
class ConnectionManager {
  constructor() {
    // 存储共享功能和组件
    this.features = {};
    this.components = {};

    // 存储页面状态
    this.pageState = {};

    // 存储事件监听器
    this.eventListeners = {};

    // 是否已初始化
    this.initialized = false;

    // 暴露到全局
    window.ConnectionManager = this;
  }

  /**
   * 初始化连接管理器
   */
  init() {
    if (this.initialized) return;

    console.log('[连接点管理器] 正在初始化...');

    // 加载共享样式
    this.loadSharedStyles();

    // 加载共享脚本
    this.loadSharedScripts();

    // 注册核心功能
    this.registerCoreFeatures();

    // 设置页面通信
    this.setupPageCommunication();

    this.initialized = true;
    console.log('[连接点管理器] 初始化完成');

    // 触发初始化完成事件
    this.triggerEvent('connection.initialized');
  }

  /**
   * 加载共享样式
   */
  loadSharedStyles() {
    // 检查是否已加载共享样式
    if (document.querySelector('link[href="shared.css"]')) {
      return;
    }

    // 创建并添加共享样式链接
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'shared.css';
    document.head.appendChild(link);

    // 加载Font Awesome图标库（如果未加载）
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const faLink = document.createElement('link');
      faLink.rel = 'stylesheet';
      faLink.href =
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
      document.head.appendChild(faLink);
    }
  }

  /**
   * 加载共享脚本
   */
  loadSharedScripts() {
    // 检查是否已加载共享脚本
    if (document.querySelector('script[src="shared.js"]')) {
      return;
    }

    return new Promise((resolve) => {
      // 创建并添加共享脚本
      const script = document.createElement('script');
      script.src = 'shared.js';
      script.onload = () => {
        console.log('[连接点管理器] 共享脚本加载完成');
        resolve();
      };
      document.body.appendChild(script);
    });
  }

  /**
   * 注册核心功能
   */
  registerCoreFeatures() {
    // 注册UI组件
    this.registerComponent('navbar', this.createNavbar);
    this.registerComponent('footer', this.createFooter);
    this.registerComponent('pageLoader', this.createPageLoader);
    this.registerComponent('backToTop', this.createBackToTop);

    // 注册功能模块
    this.registerFeature('messaging', {
      showMessage: this.showMessageWrapper,
    });

    this.registerFeature('logging', {
      logOperation: this.logOperationWrapper,
    });

    this.registerFeature('navigation', {
      navigateTo: this.navigateTo,
      handleLinkClick: this.handleLinkClick,
    });
  }

  /**
   * 设置页面通信
   */
  setupPageCommunication() {
    // 使用localStorage作为跨页面通信渠道
    window.addEventListener('storage', (e) => {
      if (e.key.startsWith('connection-event-')) {
        const eventName = e.key.replace('connection-event-', '');
        const data = JSON.parse(e.newValue);
        this.triggerEvent(eventName, data);
      }
    });
  }

  /**
   * 注册功能模块
   * @param {string} name 功能名称
   * @param {object} feature 功能对象
   */
  registerFeature(name, feature) {
    this.features[name] = feature;
    console.log(`[连接点管理器] 功能已注册: ${name}`);
  }

  /**
   * 获取功能模块
   * @param {string} name 功能名称
   * @returns {object} 功能对象
   */
  getFeature(name) {
    return this.features[name];
  }

  /**
   * 注册组件
   * @param {string} name 组件名称
   * @param {function} factory 组件工厂函数
   */
  registerComponent(name, factory) {
    this.components[name] = factory;
    console.log(`[连接点管理器] 组件已注册: ${name}`);
  }

  /**
   * 创建并插入组件
   * @param {string} name 组件名称
   * @param {HTMLElement} container 容器元素
   * @param {object} options 组件选项
   * @returns {HTMLElement} 创建的组件元素
   */
  createComponent(name, container, options = {}) {
    if (!this.components[name]) {
      console.error(`[连接点管理器] 未找到组件: ${name}`);
      return null;
    }

    const element = this.components[name](options);
    if (container && element) {
      container.appendChild(element);
    }
    return element;
  }

  /**
   * 设置页面状态
   * @param {string} key 状态键
   * @param {*} value 状态值
   */
  setState(key, value) {
    this.pageState[key] = value;

    // 保存到localStorage以实现跨页面共享
    try {
      localStorage.setItem(`page-state-${key}`, JSON.stringify(value));
    } catch (e) {
      console.error('[连接点管理器] 保存状态失败:', e);
    }
  }

  /**
   * 获取页面状态
   * @param {string} key 状态键
   * @returns {*} 状态值
   */
  getState(key) {
    // 优先从内存获取
    if (this.pageState.hasOwnProperty(key)) {
      return this.pageState[key];
    }

    // 从localStorage获取
    try {
      const stored = localStorage.getItem(`page-state-${key}`);
      if (stored) {
        const value = JSON.parse(stored);
        this.pageState[key] = value;
        return value;
      }
    } catch (e) {
      console.error('[连接点管理器] 获取状态失败:', e);
    }

    return null;
  }

  /**
   * 添加事件监听器
   * @param {string} eventName 事件名称
   * @param {function} callback 回调函数
   */
  on(eventName, callback) {
    if (!this.eventListeners[eventName]) {
      this.eventListeners[eventName] = [];
    }
    this.eventListeners[eventName].push(callback);
  }

  /**
   * 触发事件
   * @param {string} eventName 事件名称
   * @param {*} data 事件数据
   */
  triggerEvent(eventName, data = {}) {
    if (this.eventListeners[eventName]) {
      this.eventListeners[eventName].forEach((callback) => {
        try {
          callback(data);
        } catch (e) {
          console.error(`[连接点管理器] 事件处理失败: ${eventName}`, e);
        }
      });
    }

    // 跨页面触发事件
    try {
      localStorage.setItem(
        `connection-event-${eventName}`,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
      // 立即删除以允许重复触发
      setTimeout(() => {
        localStorage.removeItem(`connection-event-${eventName}`);
      }, 100);
    } catch (e) {
      console.error('[连接点管理器] 跨页面事件触发失败:', e);
    }
  }

  /**
   * 导航到指定页面
   * @param {string} url 页面URL
   * @param {object} state 页面状态
   */
  navigateTo(url, state = {}) {
    // 保存状态
    if (Object.keys(state).length > 0) {
      for (const [key, value] of Object.entries(state)) {
        this.setState(key, value);
      }
    }

    // 执行导航
    window.location.href = url;
  }

  /**
   * 处理链接点击
   * @param {HTMLElement} link 链接元素
   */
  handleLinkClick(link) {
    const href = link.getAttribute('href');
    if (href && !href.startsWith('http') && href !== '#') {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigateTo(href);
      });
    }
  }

  /**
   * 创建导航栏
   * @param {object} options 配置选项
   * @returns {HTMLElement} 导航栏元素
   */
  createNavbar(options = {}) {
    // 从现有的index.html结构创建导航栏
    const navbar = document.createElement('nav');
    navbar.className = 'navbar';
    navbar.innerHTML = `
            <div class="container">
                <div class="navbar-brand">
                    <a href="index.html" class="logo">数智估价</a>
                </div>
                <div class="navbar-menu">
                    <a href="index.html" class="nav-link">首页</a>
                    <a href="product-services.html" class="nav-link">产品服务</a>
                    <a href="tech-frame.html" class="nav-link">技术框架</a>
                    <a href="case-study.html" class="nav-link">成功案例</a>
                    <a href="contact.html" class="nav-link">联系我们</a>
                </div>
                <div class="navbar-actions">
                    <button class="login-btn">登录</button>
                    <button class="menu-toggle">
                        <i class="fas fa-bars"></i>
                    </button>
                </div>
            </div>
            <div class="mobile-menu">
                <a href="index.html" class="mobile-link">首页</a>
                <a href="product-services.html" class="mobile-link">产品服务</a>
                <a href="tech-frame.html" class="mobile-link">技术框架</a>
                <a href="case-study.html" class="mobile-link">成功案例</a>
                <a href="contact.html" class="mobile-link">联系我们</a>
                <button class="mobile-login-btn">登录</button>
            </div>
        `;

    return navbar;
  }

  /**
   * 创建页脚
   * @param {object} options 配置选项
   * @returns {HTMLElement} 页脚元素
   */
  createFooter(options = {}) {
    // 从现有的页脚结构创建
    const footer = document.createElement('footer');
    footer.className = 'footer';
    footer.innerHTML = `
            <div class="container">
                <div class="footer-col">
                    <h3>关于我们</h3>
                    <a href="about-us.html">公司简介</a>
                    <a href="team-intro.html">团队介绍</a>
                    <a href="#">企业文化</a>
                    <a href="#">发展历程</a>
                </div>
                <div class="footer-col">
                    <h3>产品服务</h3>
                    <a href="product-services.html">核心产品</a>
                    <a href="core-function.html">功能介绍</a>
                    <a href="case-study.html">成功案例</a>
                    <a href="#">解决方案</a>
                </div>
                <div class="footer-col">
                    <h3>资源中心</h3>
                    <a href="industry-news.html">行业动态</a>
                    <a href="help-center.html">帮助中心</a>
                    <a href="#">技术文档</a>
                    <a href="#">白皮书</a>
                </div>
                <div class="footer-col">
                    <h3>联系我们</h3>
                    <a href="tel:16680508457"><i class="fas fa-phone-alt"></i> 16680508457</a>
                    <a href="mailto:1558691995@qq.com"><i class="fas fa-envelope"></i> 1558691995@qq.com</a>
                    <a href="#"><i class="fas fa-map-marker-alt"></i> 北京市海淀区科技园区</a>
                </div>
            </div>
            <div class="cooperation-enterprises">
                <span>合作企业：湖南智信房地产土地资产评估有限公司 | 长沙力智数字房产技术发展有限公司</span>
            </div>
            <div class="copyright">
                <p>© 2024 数智估价核心引擎 版权所有</p>
                <p><a href="https://beian.miit.gov.cn/" target="_blank">湘ICP备2025144327号-1</a> | <a href="https://beian.mps.gov.cn/#/query/webSearch?code=43011202001203" target="_blank" rel="noreferrer">湘公网安备43011202001203号</a></p>
            </div>
        `;

    return footer;
  }

  /**
   * 创建页面加载动画
   * @param {object} options 配置选项
   * @returns {HTMLElement} 加载动画元素
   */
  createPageLoader(options = {}) {
    const loader = document.createElement('div');
    loader.id = 'pageLoader';
    loader.className = 'page-loader';
    loader.innerHTML = `
            <div class="loader-container">
                <div class="loader-spinner"></div>
                <div class="loader-text">正在加载...</div>
            </div>
        `;
    return loader;
  }

  /**
   * 创建返回顶部按钮
   * @param {object} options 配置选项
   * @returns {HTMLElement} 返回顶部按钮元素
   */
  createBackToTop(options = {}) {
    const button = document.createElement('button');
    button.id = 'backToTop';
    button.className = 'back-to-top';
    button.innerHTML = '<i class="fas fa-arrow-up"></i>';
    button.style.display = 'none';
    return button;
  }

  /**
   * 消息提示包装器
   */
  showMessageWrapper(message, type = 'info') {
    if (typeof window.showMessage === 'function') {
      window.showMessage(message, type);
    } else {
      // 降级到简单alert
      console.warn('[连接点管理器] 消息系统未加载，使用简单提示');
      alert(message);
    }
  }

  /**
   * 操作日志包装器
   */
  logOperationWrapper(page, action, details = '') {
    if (typeof window.logUserOperation === 'function') {
      window.logUserOperation(page, action, details);
    } else {
      // 降级到console.log
      console.log(
        `[用户操作] 页面: ${page}, 操作: ${action}, 详情: ${details}`
      );
    }
  }

  /**
   * 应用连接点到当前页面
   * @param {object} options 配置选项
   */
  applyToPage(options = {}) {
    // 初始化连接管理器
    this.init();

    // 创建并插入UI组件
    if (options.navbar !== false) {
      const header = document.querySelector('header') || document.body;
      const navbar = this.createComponent(
        'navbar',
        null,
        options.navbarOptions || {}
      );
      if (header.firstChild) {
        header.insertBefore(navbar, header.firstChild);
      } else {
        header.appendChild(navbar);
      }
    }

    if (options.footer !== false) {
      const body = document.body;
      body.appendChild(
        this.createComponent('footer', null, options.footerOptions || {})
      );
    }

    if (options.pageLoader !== false) {
      const body = document.body;
      body.insertBefore(
        this.createComponent('pageLoader', null, options.loaderOptions || {}),
        body.firstChild
      );
    }

    if (options.backToTop !== false) {
      document.body.appendChild(
        this.createComponent('backToTop', null, options.backToTopOptions || {})
      );
    }

    // 处理页面链接
    if (options.handleLinks !== false) {
      document.querySelectorAll('a').forEach((link) => {
        this.handleLinkClick(link);
      });
    }

    console.log('[连接点管理器] 已应用到当前页面');
    this.triggerEvent('connection.applied');

    return this;
  }
}

// 创建并导出单例实例
const connectionManager = new ConnectionManager();

// 自动初始化（可选）
document.addEventListener('DOMContentLoaded', () => {
  // 检查是否需要自动应用
  if (window.AUTO_APPLY_CONNECTION !== false) {
    connectionManager.applyToPage();
  }
});

// 为了兼容不使用ES模块的环境
if (typeof window !== 'undefined') {
  window.ConnectionManager = connectionManager;
}
