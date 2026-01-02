// 页面优化工具脚本
// 提供多页应用核心功能优化的各种工具函数

// 首先加载连接点优化脚本
(function () {
  // 检测当前页面
  const currentPage = window.location.pathname;
  let scriptPath = 'js/connection-optimizer.js';

  // 为特定页面加载专用优化脚本
  if (currentPage.includes('product-services.html')) {
    scriptPath = 'js/product-services-optimizer.js';
  }

  const script = document.createElement('script');
  script.src = scriptPath;
  script.async = false; // 同步加载以确保在其他脚本之前执行
  document.head.insertBefore(script, document.head.firstChild);
  console.log(`为页面${currentPage}加载优化脚本: ${scriptPath}`);
})();

if (!window.pageOptimizer) {
  window.pageOptimizer = {
    version: '1.0.0',
    initialized: false,
    config: {
      enableLazyLoad: true,
      enablePreload: true,
      enableCache: true,
      enableMinimize: true,
    },

    // 初始化优化器
    init: function (options = {}) {
      if (this.initialized) return;

      // 合并配置
      Object.assign(this.config, options);

      console.log('页面优化器初始化中...');

      // 设置页面加载优化
      this.setupPageLoadOptimization();

      // 设置资源优化
      if (this.config.enableLazyLoad) {
        this.setupLazyLoading();
      }

      if (this.config.enablePreload) {
        this.setupResourcePreloading();
      }

      // 设置缓存优化
      if (this.config.enableCache) {
        this.setupCacheOptimization();
      }

      // 设置连接点集成
      this.setupConnectionPointIntegration();

      this.initialized = true;
      console.log('页面优化器初始化完成');
    },

    // 设置页面加载优化
    setupPageLoadOptimization: function () {
      // 减少阻塞渲染的资源
      this.deferNonCriticalScripts();

      // 优化字体加载
      this.optimizeFontLoading();

      // 设置关键CSS优化
      this.optimizeCriticalCSS();

      // 监听页面加载事件，优化加载完成后的操作
      window.addEventListener('load', () => {
        this.onPageFullyLoaded();
      });
    },

    // 延迟非关键脚本
    deferNonCriticalScripts: function () {
      const scripts = document.querySelectorAll(
        'script:not([defer]):not([async])'
      );
      scripts.forEach((script) => {
        // 跳过内联脚本和关键脚本
        if (!script.src || script.hasAttribute('data-critical')) return;

        // 为非关键脚本添加defer属性
        script.setAttribute('defer', '');
      });
    },

    // 优化字体加载
    optimizeFontLoading: function () {
      // 添加字体显示策略
      const style = document.createElement('style');
      style.textContent = `
                @font-face {
                    font-display: swap;
                }
                
                /* 字体加载期间使用系统字体 */
                body {
                    font-display: swap;
                }
            `;
      document.head.appendChild(style);
    },

    // 优化关键CSS
    optimizeCriticalCSS: function () {
      // 检查是否已有关键CSS
      if (!document.querySelector('style[data-critical-css]')) {
        // 这里可以动态注入关键CSS
        // 目前仅作为占位，实际项目中应根据具体页面生成关键CSS
      }
    },

    // 设置懒加载
    setupLazyLoading: function () {
      // 图片懒加载
      this.setupImageLazyLoading();

      // iframe懒加载
      this.setupIframeLazyLoading();

      // 组件懒加载
      this.setupComponentLazyLoading();
    },

    // 设置图片懒加载
    setupImageLazyLoading: function () {
      // 检查浏览器是否支持原生懒加载
      if ('loading' in HTMLImageElement.prototype) {
        // 为所有没有设置loading属性的图片添加lazy属性
        const images = document.querySelectorAll('img:not([loading])');
        images.forEach((img) => {
          img.setAttribute('loading', 'lazy');
        });
      } else {
        // 降级方案：使用Intersection Observer
        this.setupIntersectionObserverForImages();
      }
    },

    // 为图片设置Intersection Observer
    setupIntersectionObserverForImages: function () {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            // 如果有data-src属性，将其赋值给src
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            // 解除观察
            observer.unobserve(img);
          }
        });
      });

      // 观察所有带有data-src属性的图片
      const lazyImages = document.querySelectorAll('img[data-src]');
      lazyImages.forEach((img) => {
        imageObserver.observe(img);
      });
    },

    // 设置iframe懒加载
    setupIframeLazyLoading: function () {
      // 为所有没有设置loading属性的iframe添加lazy属性
      const iframes = document.querySelectorAll('iframe:not([loading])');
      iframes.forEach((iframe) => {
        iframe.setAttribute('loading', 'lazy');
      });
    },

    // 设置组件懒加载
    setupComponentLazyLoading: function () {
      // 查找带有data-lazy-component属性的元素
      const lazyComponents = document.querySelectorAll('[data-lazy-component]');

      const componentObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const element = entry.target;
              const componentName = element.dataset.lazyComponent;

              // 动态加载组件
              this.loadLazyComponent(element, componentName);

              // 解除观察
              observer.unobserve(element);
            }
          });
        }
      );

      // 观察所有懒加载组件
      lazyComponents.forEach((component) => {
        componentObserver.observe(component);
      });
    },

    // 加载懒加载组件
    loadLazyComponent: function (element, componentName) {
      // 这里是组件加载的占位实现
      // 实际项目中应根据组件名称动态加载对应的组件代码
      console.log(`加载懒加载组件: ${componentName}`);

      // 简单示例：显示加载状态
      element.innerHTML = `<div class="loading-content">
                <div class="loading-spinner"></div>
                <p>加载${componentName}组件中...</p>
            </div>`;

      // 模拟组件加载完成
      setTimeout(() => {
        // 这里应该替换为实际组件的渲染
        element.innerHTML = `<div class="lazy-loaded-component">
                    <p>${componentName}组件已加载</p>
                </div>`;
      }, 1000);
    },

    // 设置资源预加载
    setupResourcePreloading: function () {
      // 预加载关键资源
      this.preloadCriticalResources();

      // 预加载可能导航到的页面资源
      this.preloadNavigationResources();
    },

    // 预加载关键资源
    preloadCriticalResources: function () {
      // 查找页面中标记为预加载的资源
      const preloadLinks = document.querySelectorAll('link[rel="preload"]');
      const criticalAssets = [];

      // 收集关键CSS和字体文件
      document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
        if (
          link.hasAttribute('data-critical') &&
          !link.hasAttribute('rel', 'preload')
        ) {
          criticalAssets.push({
            href: link.href,
            as: 'style',
          });
        }
      });

      // 收集关键字体
      const fontUrls = new Set();
      const styleSheets = document.styleSheets;
      for (let i = 0; i < styleSheets.length; i++) {
        try {
          const rules = styleSheets[i].cssRules || styleSheets[i].rules;
          if (rules) {
            for (let j = 0; j < rules.length; j++) {
              const rule = rules[j];
              if (rule.type === CSSRule.FONT_FACE_RULE) {
                const srcValue = rule.style.getPropertyValue('src');
                const urlMatch = srcValue.match(/url\(['"]?([^'"]+)['"]?\)/);
                if (urlMatch && urlMatch[1]) {
                  fontUrls.add(urlMatch[1]);
                }
              }
            }
          }
        } catch (e) {
          // 忽略跨域样式表的访问错误
        }
      }

      // 添加字体预加载
      fontUrls.forEach((url) => {
        criticalAssets.push({
          href: url,
          as: 'font',
          crossorigin: 'anonymous',
        });
      });

      // 创建预加载链接
      criticalAssets.forEach((asset) => {
        // 检查是否已经预加载
        const exists = Array.from(preloadLinks).some(
          (link) => link.href === asset.href
        );
        if (!exists) {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.href = asset.href;
          link.as = asset.as;
          if (asset.crossorigin) {
            link.crossOrigin = asset.crossorigin;
          }
          document.head.appendChild(link);
        }
      });
    },

    // 预加载可能导航到的页面资源
    preloadNavigationResources: function () {
      // 查找页面中的链接
      const links = document.querySelectorAll('a[href]');
      const navigationUrls = new Set();

      links.forEach((link) => {
        const href = link.getAttribute('href');
        // 只处理同域链接，排除锚点链接、下载链接和外部链接
        if (
          href &&
          !href.startsWith('#') &&
          !href.startsWith('http') &&
          !link.hasAttribute('download') &&
          href.endsWith('.html')
        ) {
          navigationUrls.add(href);
        }
      });

      // 限制预加载的数量，避免过多资源请求
      const MAX_PREFETCH = 5;
      let count = 0;

      // 为可能导航的页面添加prefetch
      navigationUrls.forEach((url) => {
        if (count < MAX_PREFETCH) {
          // 检查是否已经prefetch
          if (!document.querySelector(`link[rel="prefetch"][href="${url}"]`)) {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = url;
            document.head.appendChild(link);
            count++;
          }
        }
      });
    },

    // 设置缓存优化
    setupCacheOptimization: function () {
      // 尝试使用localStorage缓存非关键数据
      this.setupLocalStorageCaching();
    },

    // 设置localStorage缓存
    setupLocalStorageCaching: function () {
      // 创建缓存管理对象
      this.cacheManager = {
        // 获取缓存
        get: function (key) {
          try {
            const item = localStorage.getItem(key);
            if (item) {
              const parsed = JSON.parse(item);
              // 检查是否过期
              if (parsed.expiry && parsed.expiry < Date.now()) {
                localStorage.removeItem(key);
                return null;
              }
              return parsed.data;
            }
          } catch (e) {
            console.error('获取缓存失败:', e);
          }
          return null;
        },

        // 设置缓存
        set: function (key, data, ttl = 3600000) {
          // 默认1小时
          try {
            const item = {
              data: data,
              expiry: ttl ? Date.now() + ttl : null,
            };
            localStorage.setItem(key, JSON.stringify(item));
            return true;
          } catch (e) {
            console.error('设置缓存失败:', e);
            return false;
          }
        },

        // 移除缓存
        remove: function (key) {
          try {
            localStorage.removeItem(key);
            return true;
          } catch (e) {
            console.error('移除缓存失败:', e);
            return false;
          }
        },

        // 清除所有缓存
        clear: function () {
          try {
            localStorage.clear();
            return true;
          } catch (e) {
            console.error('清除缓存失败:', e);
            return false;
          }
        },
      };
    },

    // 设置连接点集成
    setupConnectionPointIntegration: function () {
      // 检查连接点是否可用
      if (window.connectionPoint) {
        // 监听连接点初始化完成事件
        window.connectionPoint.on('initialized', () => {
          console.log('连接点已初始化，开始集成');
          this.onConnectionPointReady();
        });
      } else {
        // 如果连接点尚未加载，尝试加载
        this.loadConnectionPoint();
      }
    },

    // 加载连接点
    loadConnectionPoint: function () {
      // 检查连接点脚本是否已加载
      if (!document.querySelector('script[src="/connection-point.js"]')) {
        const script = document.createElement('script');
        script.src = '/connection-point.js';
        script.async = true;
        script.onload = () => {
          console.log('连接点脚本已加载');
          // 监听连接点初始化完成
          if (window.connectionPoint) {
            window.connectionPoint.on('initialized', () => {
              this.onConnectionPointReady();
            });
          }
        };
        document.head.appendChild(script);
      }
    },

    // 连接点准备就绪回调
    onConnectionPointReady: function () {
      // 注册页面信息到连接点
      window.connectionPoint.syncData('pageInfo', this.getCurrentPageInfo());

      // 同步优化器配置到其他页面
      window.connectionPoint.syncData('optimizerConfig', this.config);

      // 监听来自其他页面的数据更新
      window.connectionPoint.on('dataUpdated', (data) => {
        this.handleDataUpdate(data);
      });
    },

    // 处理数据更新
    handleDataUpdate: function (data) {
      const { key, value } = data;

      switch (key) {
        case 'optimizerConfig':
          // 更新配置
          Object.assign(this.config, value);
          break;
        case 'pageNavigation':
          // 处理页面导航请求
          this.handleNavigationRequest(value);
          break;
        default:
          // 处理其他数据更新
          console.log('收到数据更新:', key, value);
      }
    },

    // 处理导航请求
    handleNavigationRequest: function (data) {
      const { url, options = {} } = data;

      // 如果当前页面就是目标页面，不执行导航
      if (window.location.pathname === url) return;

      // 执行导航
      if (options.replace) {
        window.location.replace(url);
      } else {
        window.location.href = url;
      }
    },

    // 页面完全加载后的处理
    onPageFullyLoaded: function () {
      // 优化页面交互性能
      this.optimizeInteractionPerformance();

      // 优化动画性能
      this.optimizeAnimationPerformance();

      // 通知连接点页面已完全加载
      if (window.connectionPoint && window.connectionPoint.isAvailable()) {
        window.connectionPoint.emit(
          'pageFullyLoaded',
          this.getCurrentPageInfo()
        );
      }
    },

    // 优化交互性能
    optimizeInteractionPerformance: function () {
      // 为交互元素添加触摸反馈优化
      const interactiveElements = document.querySelectorAll(
        'button, a, [role="button"]'
      );

      interactiveElements.forEach((element) => {
        // 避免重复添加
        if (!element.hasAttribute('data-interaction-optimized')) {
          // 添加触摸反馈样式类
          element.classList.add('optimized-interaction');
          element.setAttribute('data-interaction-optimized', 'true');
        }
      });
    },

    // 优化动画性能
    optimizeAnimationPerformance: function () {
      // 为动画元素添加will-change属性
      const animatedElements = document.querySelectorAll(
        '.animated, [data-animation], [class*="animate-"]'
      );

      animatedElements.forEach((element) => {
        // 避免重复添加
        if (!element.hasAttribute('data-animation-optimized')) {
          // 添加will-change属性，优化动画性能
          element.style.willChange = 'transform, opacity';
          element.setAttribute('data-animation-optimized', 'true');
        }
      });
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
        userAgent: navigator.userAgent,
        screenSize: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      };
    },

    // 获取优化器配置
    getConfig: function () {
      return { ...this.config };
    },

    // 更新优化器配置
    updateConfig: function (newConfig) {
      Object.assign(this.config, newConfig);

      // 同步配置到其他页面
      if (window.connectionPoint && window.connectionPoint.isAvailable()) {
        window.connectionPoint.syncData('optimizerConfig', this.config);
      }

      return this.config;
    },

    // 检查优化器是否已初始化
    isInitialized: function () {
      return this.initialized;
    },

    // 获取优化器版本
    getVersion: function () {
      return this.version;
    },
  };

  // 自动初始化优化器
  window.addEventListener('DOMContentLoaded', function () {
    window.pageOptimizer.init();
  });

  // 如果DOM已经加载完成，立即初始化
  if (
    document.readyState === 'complete' ||
    document.readyState === 'interactive'
  ) {
    setTimeout(function () {
      window.pageOptimizer.init();
    }, 0);
  }
}

// 导出页面优化器到全局命名空间
window.pageOptimizer = window.pageOptimizer || {};
