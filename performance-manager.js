// 性能管理器 - 数智估价核心引擎

/**
 * 性能管理器类
 * 负责性能监控、资源优化、响应式适配和性能优化
 */
class PerformanceManager {
  constructor() {
    // 配置项
    this.config = {
      enableMonitoring: true,
      enableLazyLoading: true,
      enableImageOptimization: true,
      enableResourceCaching: true,
      enableCriticalCSS: true,
      performanceThresholds: {
        fcp: 1800, // First Contentful Paint (ms)
        lcp: 2500, // Largest Contentful Paint (ms)
        fid: 100, // First Input Delay (ms)
        cls: 0.1, // Cumulative Layout Shift
        tti: 3800, // Time to Interactive (ms)
      },
      breakpoints: {
        xs: 480,
        sm: 768,
        md: 992,
        lg: 1200,
        xl: 1440,
      },
      imageQuality: 80,
      resourceCacheTTL: 3600000, // 1小时
    };

    // 性能指标数据
    this.metrics = {
      navigation: null,
      paint: {},
      timing: {},
      memory: null,
      network: [],
      user: {
        interactions: [],
      },
    };

    // 缓存管理
    this.caches = new Map();

    // 资源加载队列
    this.loadingQueue = new Set();

    // 响应式状态
    this.currentBreakpoint = null;

    // 初始化状态
    this.initialized = false;

    // 初始化
    this.initialize();
  }

  /**
   * 初始化性能管理器
   */
  initialize() {
    if (this.initialized) return;

    // 设置响应式监听
    this.setupResponsiveListener();

    // 设置性能监控
    if (this.config.enableMonitoring) {
      this.setupPerformanceMonitoring();
    }

    // 设置资源优化
    if (this.config.enableResourceCaching) {
      this.setupResourceCaching();
    }

    // 设置懒加载
    if (this.config.enableLazyLoading) {
      this.setupLazyLoading();
    }

    // 设置图片优化
    if (this.config.enableImageOptimization) {
      this.setupImageOptimization();
    }

    // 设置用户交互监控
    this.setupUserInteractionMonitoring();

    this.initialized = true;
    console.log('性能管理器已初始化');
  }

  /**
   * 设置响应式断点监听
   */
  setupResponsiveListener() {
    // 初始检测
    this.updateCurrentBreakpoint();

    // 监听窗口大小变化
    window.addEventListener(
      'resize',
      this.debounce(() => {
        const previousBreakpoint = this.currentBreakpoint;
        this.updateCurrentBreakpoint();

        // 断点变化时触发事件
        if (previousBreakpoint !== this.currentBreakpoint) {
          this.emit('breakpointChange', {
            previous: previousBreakpoint,
            current: this.currentBreakpoint,
            width: window.innerWidth,
          });
        }
      }, 200)
    );
  }

  /**
   * 更新当前断点
   */
  updateCurrentBreakpoint() {
    const width = window.innerWidth;
    const breakpoints = this.config.breakpoints;

    if (width < breakpoints.xs) {
      this.currentBreakpoint = 'xs';
    } else if (width < breakpoints.sm) {
      this.currentBreakpoint = 'xs';
    } else if (width < breakpoints.md) {
      this.currentBreakpoint = 'sm';
    } else if (width < breakpoints.lg) {
      this.currentBreakpoint = 'md';
    } else if (width < breakpoints.xl) {
      this.currentBreakpoint = 'lg';
    } else {
      this.currentBreakpoint = 'xl';
    }
  }

  /**
   * 设置性能监控
   */
  setupPerformanceMonitoring() {
    // 检查浏览器支持
    if (!window.performance) {
      console.warn('当前浏览器不支持Performance API');
      return;
    }

    // 导航计时
    this.metrics.navigation = performance.getEntriesByType('navigation')[0];

    // 监听性能条目
    if ('PerformanceObserver' in window) {
      // 监听绘制指标
      this.setupPaintObserver();

      // 监听资源加载
      this.setupResourceObserver();

      // 监听长任务
      this.setupLongTaskObserver();

      // 监听用户计时
      this.setupUserTimingObserver();
    }

    // 内存使用监控（如果支持）
    if ('memory' in performance) {
      this.monitorMemory();
    }

    // 页面加载完成后收集性能数据
    window.addEventListener('load', () => {
      this.collectPerformanceMetrics();
    });
  }

  /**
   * 设置绘制指标监听器
   */
  setupPaintObserver() {
    try {
      const paintObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.metrics.paint[entry.name] = entry.startTime;
        });
      });
      paintObserver.observe({ type: 'paint', buffered: true });
    } catch (error) {
      console.warn('设置绘制指标监听器失败:', error);
    }
  }

  /**
   * 设置资源加载监听器
   */
  setupResourceObserver() {
    try {
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.metrics.network.push({
            name: entry.name,
            type: entry.initiatorType,
            duration: entry.duration,
            size: entry.transferSize,
            startTime: entry.startTime,
          });
        });
      });
      resourceObserver.observe({ type: 'resource', buffered: true });
    } catch (error) {
      console.warn('设置资源加载监听器失败:', error);
    }
  }

  /**
   * 设置长任务监听器
   */
  setupLongTaskObserver() {
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          // 记录长任务（> 50ms）
          if (entry.duration > 50) {
            console.warn(
              `检测到长任务 (${entry.duration.toFixed(2)}ms):`,
              entry
            );
          }
        });
      });
      longTaskObserver.observe({ type: 'longtask', buffered: true });
    } catch (error) {
      console.warn('设置长任务监听器失败:', error);
    }
  }

  /**
   * 设置用户计时监听器
   */
  setupUserTimingObserver() {
    try {
      const userTimingObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.metrics.timing[entry.name] = {
            startTime: entry.startTime,
            duration: entry.duration || 0,
          };
        });
      });
      userTimingObserver.observe({ type: 'measure', buffered: true });
    } catch (error) {
      console.warn('设置用户计时监听器失败:', error);
    }
  }

  /**
   * 收集性能指标
   */
  collectPerformanceMetrics() {
    // 计算TTI (Time to Interactive) 近似值
    this.calculateTTI();

    // 检测性能问题
    this.detectPerformanceIssues();

    // 记录性能报告
    this.generatePerformanceReport();
  }

  /**
   * 计算TTI近似值
   */
  calculateTTI() {
    if (this.metrics.navigation) {
      const domContentLoaded = this.metrics.navigation.domContentLoadedEventEnd;
      const loadEvent = this.metrics.navigation.loadEventEnd;
      // 使用DOMContentLoaded和load事件之间的中点作为TTI的粗略估计
      this.metrics.timing.tti = (domContentLoaded + loadEvent) / 2;
    }
  }

  /**
   * 检测性能问题
   */
  detectPerformanceIssues() {
    const issues = [];
    const thresholds = this.config.performanceThresholds;

    // 检查LCP
    if (
      this.metrics.paint.largestContentfulPaint &&
      this.metrics.paint.largestContentfulPaint > thresholds.lcp
    ) {
      issues.push({
        type: 'LCP',
        value: this.metrics.paint.largestContentfulPaint,
        threshold: thresholds.lcp,
        message: '最大内容绘制时间过长',
      });
    }

    // 检查FCP
    if (
      this.metrics.paint.firstContentfulPaint &&
      this.metrics.paint.firstContentfulPaint > thresholds.fcp
    ) {
      issues.push({
        type: 'FCP',
        value: this.metrics.paint.firstContentfulPaint,
        threshold: thresholds.fcp,
        message: '首次内容绘制时间过长',
      });
    }

    // 检查TTI
    if (this.metrics.timing.tti && this.metrics.timing.tti > thresholds.tti) {
      issues.push({
        type: 'TTI',
        value: this.metrics.timing.tti,
        threshold: thresholds.tti,
        message: '可交互时间过长',
      });
    }

    // 检查大资源
    this.metrics.network.forEach((resource) => {
      if (resource.size > 1024 * 1024) {
        // > 1MB
        issues.push({
          type: 'largeResource',
          resource: resource.name,
          size: resource.size,
          message: `资源过大: ${resource.name} (${(resource.size / 1024).toFixed(2)}KB)`,
        });
      }
    });

    if (issues.length > 0) {
      console.warn('检测到性能问题:', issues);
      this.emit('performanceIssues', issues);
    }
  }

  /**
   * 生成性能报告
   */
  generatePerformanceReport() {
    const report = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      metrics: {
        navigation: this.metrics.navigation,
        paint: this.metrics.paint,
        timing: this.metrics.timing,
        network: this.metrics.network.slice(-20), // 只保留最近20个资源
      },
      device: {
        width: window.innerWidth,
        height: window.innerHeight,
        breakpoint: this.currentBreakpoint,
        userAgent: navigator.userAgent,
      },
    };

    console.log('性能报告:', report);
    return report;
  }

  /**
   * 监控内存使用
   */
  monitorMemory() {
    setInterval(() => {
      if ('memory' in performance) {
        this.metrics.memory = {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
        };

        // 检查内存使用是否过高（超过80%）
        const usagePercentage =
          (this.metrics.memory.usedJSHeapSize /
            this.metrics.memory.jsHeapSizeLimit) *
          100;
        if (usagePercentage > 80) {
          console.warn(`内存使用过高: ${usagePercentage.toFixed(1)}%`);
          this.emit('memoryWarning', { usage: usagePercentage });
        }
      }
    }, 60000); // 每分钟检查一次
  }

  /**
   * 设置用户交互监控
   */
  setupUserInteractionMonitoring() {
    // 监听点击事件
    document.addEventListener(
      'click',
      (event) => {
        this.metrics.user.interactions.push({
          type: 'click',
          target: this.getTargetInfo(event.target),
          timestamp: Date.now(),
          x: event.clientX,
          y: event.clientY,
        });
      },
      true
    );

    // 监听滚动事件
    window.addEventListener(
      'scroll',
      this.debounce(() => {
        this.metrics.user.interactions.push({
          type: 'scroll',
          position: window.scrollY,
          timestamp: Date.now(),
        });
      }, 1000),
      true
    );
  }

  /**
   * 获取目标元素信息
   * @param {HTMLElement} element 目标元素
   * @returns {object} 元素信息
   */
  getTargetInfo(element) {
    if (!element) return null;

    return {
      tagName: element.tagName,
      id: element.id,
      className: element.className,
      text: element.textContent
        ? element.textContent.trim().substring(0, 50)
        : '',
    };
  }

  /**
   * 设置资源缓存
   */
  setupResourceCaching() {
    // 使用内存缓存非关键资源
    window.fetch = this.wrapFetchWithCache(window.fetch);
  }

  /**
   * 包装fetch API添加缓存
   * @param {Function} originalFetch 原始fetch函数
   * @returns {Function} 包装后的fetch函数
   */
  wrapFetchWithCache(originalFetch) {
    return async (url, options) => {
      // 只缓存GET请求
      if (options && options.method && options.method !== 'GET') {
        return originalFetch(url, options);
      }

      // 检查缓存
      const cacheKey = `${url}_${JSON.stringify(options || {})}`;
      const cached = this.getFromCache(cacheKey);

      if (cached) {
        console.log(`从缓存获取: ${url}`);
        return new Response(JSON.stringify(cached.data), {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      // 发起请求
      try {
        const response = await originalFetch(url, options);

        // 如果是JSON响应，缓存它
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.clone().json();
          this.addToCache(cacheKey, data, this.config.resourceCacheTTL);
        }

        return response;
      } catch (error) {
        console.error('fetch错误:', error);
        throw error;
      }
    };
  }

  /**
   * 设置懒加载
   */
  setupLazyLoading() {
    // 检查IntersectionObserver支持
    if ('IntersectionObserver' in window) {
      this.setupLazyImageLoading();
      this.setupLazyContentLoading();
    }
  }

  /**
   * 设置图片懒加载
   */
  setupLazyImageLoading() {
    const lazyImages = document.querySelectorAll(
      'img[data-src], img[data-srcset]'
    );

    if (lazyImages.length === 0) return;

    const imageObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;

            // 设置src
            if (img.dataset.src) {
              img.src = img.dataset.src;
              delete img.dataset.src;
            }

            // 设置srcset
            if (img.dataset.srcset) {
              img.srcset = img.dataset.srcset;
              delete img.dataset.srcset;
            }

            // 加载完成后移除loading类
            img.onload = () => {
              img.classList.remove('lazy-loading');
              img.classList.add('lazy-loaded');
            };

            // 停止观察
            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: '200px 0px', // 提前200px加载
        threshold: 0.01,
      }
    );

    // 观察所有懒加载图片
    lazyImages.forEach((img) => {
      img.classList.add('lazy-loading');
      imageObserver.observe(img);
    });
  }

  /**
   * 设置内容懒加载
   */
  setupLazyContentLoading() {
    const lazyContents = document.querySelectorAll('[data-lazy-content]');

    if (lazyContents.length === 0) return;

    const contentObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target;
            const contentUrl = element.dataset.lazyContent;

            if (contentUrl) {
              this.loadLazyContent(element, contentUrl);
            }

            observer.unobserve(element);
          }
        });
      },
      {
        rootMargin: '500px 0px', // 提前500px加载
        threshold: 0.01,
      }
    );

    // 观察所有懒加载内容
    lazyContents.forEach((element) => {
      element.classList.add('lazy-loading');
      contentObserver.observe(element);
    });
  }

  /**
   * 加载懒加载内容
   * @param {HTMLElement} element 目标元素
   * @param {string} url 内容URL
   */
  async loadLazyContent(element, url) {
    try {
      element.classList.add('lazy-loading');

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`加载失败: ${response.status}`);
      }

      const content = await response.text();
      element.innerHTML = content;
      element.classList.remove('lazy-loading');
      element.classList.add('lazy-loaded');

      // 触发内容加载完成事件
      this.emit('lazyContentLoaded', { element, url });
    } catch (error) {
      console.error('加载懒加载内容失败:', error);
      element.classList.remove('lazy-loading');
      element.classList.add('lazy-error');
    }
  }

  /**
   * 设置图片优化
   */
  setupImageOptimization() {
    // 为所有图片添加延迟加载属性（如果还没有）
    document.querySelectorAll('img:not([loading])').forEach((img) => {
      // 只为非首屏图片设置lazy加载
      if (!this.isInViewport(img)) {
        img.loading = 'lazy';
      }
    });
  }

  /**
   * 检查元素是否在视口中
   * @param {HTMLElement} element 目标元素
   * @returns {boolean} 是否在视口中
   */
  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /**
   * 添加到缓存
   * @param {string} key 缓存键
   * @param {any} data 缓存数据
   * @param {number} ttl 过期时间（毫秒）
   */
  addToCache(key, data, ttl = this.config.resourceCacheTTL) {
    const expiry = Date.now() + ttl;
    this.caches.set(key, { data, expiry });

    // 清理过期缓存
    this.cleanupCache();
  }

  /**
   * 从缓存获取
   * @param {string} key 缓存键
   * @returns {any} 缓存数据或null
   */
  getFromCache(key) {
    const cached = this.caches.get(key);

    if (!cached) return null;

    // 检查是否过期
    if (Date.now() > cached.expiry) {
      this.caches.delete(key);
      return null;
    }

    return cached;
  }

  /**
   * 清理过期缓存
   */
  cleanupCache() {
    const now = Date.now();

    for (const [key, cached] of this.caches.entries()) {
      if (now > cached.expiry) {
        this.caches.delete(key);
      }
    }

    // 如果缓存过大，清理最早的条目
    if (this.caches.size > 100) {
      const oldestKeys = Array.from(this.caches.keys()).slice(0, 20);
      oldestKeys.forEach((key) => this.caches.delete(key));
    }
  }

  /**
   * 添加性能标记
   * @param {string} name 标记名称
   */
  mark(name) {
    if (window.performance && performance.mark) {
      performance.mark(name);
    }
  }

  /**
   * 测量性能
   * @param {string} name 测量名称
   * @param {string} startMark 开始标记
   * @param {string} endMark 结束标记
   */
  measure(name, startMark, endMark) {
    if (window.performance && performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
      } catch (error) {
        console.warn('性能测量失败:', error);
      }
    }
  }

  /**
   * 创建响应式图片URL
   * @param {string} baseUrl 基础URL
   * @param {object} options 选项
   * @returns {string} 优化后的图片URL
   */
  createResponsiveImageUrl(baseUrl, options = {}) {
    // 根据当前断点生成响应式图片URL
    const width = this.getResponsiveImageWidth();
    const quality = options.quality || this.config.imageQuality;

    // 这里可以根据实际的图片服务调整URL格式
    // 假设使用简单的查询参数格式
    const url = new URL(baseUrl, window.location.origin);
    url.searchParams.set('w', width.toString());
    url.searchParams.set('q', quality.toString());

    return url.toString();
  }

  /**
   * 获取响应式图片宽度
   * @returns {number} 图片宽度
   */
  getResponsiveImageWidth() {
    switch (this.currentBreakpoint) {
      case 'xs':
        return 480;
      case 'sm':
        return 768;
      case 'md':
        return 992;
      case 'lg':
        return 1200;
      case 'xl':
        return 1440;
      default:
        return 768;
    }
  }

  /**
   * 防抖函数
   * @param {Function} func 要防抖的函数
   * @param {number} wait 等待时间
   * @returns {Function} 防抖后的函数
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * 节流函数
   * @param {Function} func 要节流的函数
   * @param {number} limit 时间限制
   * @returns {Function} 节流后的函数
   */
  throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * 预加载关键资源
   * @param {Array} resources 资源数组
   */
  preloadCriticalResources(resources) {
    resources.forEach((resource) => {
      if (!this.loadingQueue.has(resource.url)) {
        this.loadingQueue.add(resource.url);

        const link = document.createElement('link');
        link.rel =
          resource.type === 'script' || resource.type === 'style'
            ? 'preload'
            : 'prefetch';
        link.as = resource.type;
        link.href = resource.url;

        if (resource.crossorigin) {
          link.crossOrigin = resource.crossorigin;
        }

        document.head.appendChild(link);

        link.onload = link.onerror = () => {
          this.loadingQueue.delete(resource.url);
        };
      }
    });
  }

  /**
   * 优化CSS
   * @param {string} css CSS内容
   * @returns {string} 优化后的CSS
   */
  optimizeCSS(css) {
    // 简单的CSS优化
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // 删除注释
      .replace(/\s+/g, ' ') // 压缩空白
      .replace(/\s*{\s*/g, '{') // 去除大括号周围的空格
      .replace(/\s*}\s*/g, '}') // 去除大括号周围的空格
      .replace(/\s*:\s*/g, ':') // 去除冒号周围的空格
      .replace(/\s*;\s*/g, ';') // 去除分号周围的空格
      .replace(/;}/g, '}') // 移除最后一个分号
      .trim();
  }

  /**
   * 生成关键CSS
   * @param {Array} selectors 选择器数组
   * @returns {Promise<string>} 关键CSS
   */
  async generateCriticalCSS(selectors) {
    // 这里是一个简化实现，实际项目中可能需要更复杂的CSS分析
    const criticalRules = [];

    // 遍历所有样式表
    for (const sheet of document.styleSheets) {
      try {
        // 处理同源样式表
        if (sheet.cssRules) {
          for (const rule of sheet.cssRules) {
            if (rule.type === CSSRule.STYLE_RULE) {
              // 检查选择器是否匹配
              const selectorText = rule.selectorText;
              if (
                selectors.some(
                  (selector) =>
                    selectorText.includes(selector) ||
                    selector.includes(selectorText)
                )
              ) {
                criticalRules.push(
                  `${rule.selectorText}{${Array.from(rule.style)
                    .map((prop) => `${prop}:${rule.style[prop]}`)
                    .join(';')}}`
                );
              }
            }
          }
        }
      } catch (error) {
        // 忽略跨域样式表的错误
        console.warn('无法访问样式表:', sheet.href, error);
      }
    }

    return this.optimizeCSS(criticalRules.join(''));
  }

  /**
   * 执行代码分割
   * @param {Function} importFn 动态导入函数
   * @returns {Promise} 导入结果
   */
  async dynamicImport(importFn) {
    try {
      this.mark('dynamic-import-start');
      const result = await importFn();
      this.mark('dynamic-import-end');
      this.measure(
        'dynamic-import',
        'dynamic-import-start',
        'dynamic-import-end'
      );
      return result;
    } catch (error) {
      console.error('动态导入失败:', error);
      throw error;
    }
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

    // 注册性能管理功能
    connectionManager.registerFeature('performance', {
      getMetrics: () => this.metrics,
      getReport: () => this.generatePerformanceReport(),
      getCurrentBreakpoint: () => this.currentBreakpoint,
      isMobile: () => ['xs', 'sm'].includes(this.currentBreakpoint),
      mark: this.mark.bind(this),
      measure: this.measure.bind(this),
      preload: this.preloadCriticalResources.bind(this),
      dynamicImport: this.dynamicImport.bind(this),
      createResponsiveImageUrl: this.createResponsiveImageUrl.bind(this),
      debounce: this.debounce.bind(this),
      throttle: this.throttle.bind(this),
    });

    console.log('性能管理器已成功注册到连接管理器');
  }

  /**
   * 事件监听器
   */
  on(event, listener) {
    if (!this._eventListeners) {
      this._eventListeners = new Map();
    }

    if (!this._eventListeners.has(event)) {
      this._eventListeners.set(event, new Set());
    }

    this._eventListeners.get(event).add(listener);
  }

  /**
   * 移除事件监听器
   */
  off(event, listener) {
    if (this._eventListeners && this._eventListeners.has(event)) {
      this._eventListeners.get(event).delete(listener);

      if (this._eventListeners.get(event).size === 0) {
        this._eventListeners.delete(event);
      }
    }
  }

  /**
   * 触发事件
   */
  emit(event, data) {
    if (this._eventListeners && this._eventListeners.has(event)) {
      this._eventListeners.get(event).forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          console.error(`事件监听器执行失败 [${event}]:`, error);
        }
      });
    }
  }
}

// 创建性能管理器实例
const performanceManager = new PerformanceManager();

// 自动注册到连接管理器（如果存在）
if (window.ConnectionManager) {
  performanceManager.registerToConnectionManager(window.ConnectionManager);
} else {
  // 监听连接管理器加载
  window.addEventListener('connection.initialized', (event) => {
    if (window.ConnectionManager) {
      performanceManager.registerToConnectionManager(window.ConnectionManager);
    }
  });
}

// 为了兼容不使用ES模块的环境
if (typeof window !== 'undefined') {
  window.PerformanceManager = performanceManager;
}
