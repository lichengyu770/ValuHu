// product-services.html页面优化脚本 - 移除底部额外显示的连接点内容

// 立即执行函数，避免全局变量污染
(function () {
  console.log('开始优化product-services.html页面，移除连接点内容');

  // 动态加载覆盖样式
  function loadOverrideStyles() {
    const styleId = 'hide-connection-point-styles';

    // 检查是否已加载样式
    if (!document.getElementById(styleId)) {
      const style = document.createElement('link');
      style.id = styleId;
      style.rel = 'stylesheet';
      style.href = 'css/hide-connection-point.css';
      document.head.appendChild(style);
      console.log('已加载连接点隐藏样式');
    }
  }

  // 禁用连接点功能
  function disableConnectionPoint() {
    // 备份原始连接点对象（如果存在）
    window._originalConnectionPoint =
      window._originalConnectionPoint || window.connectionPoint;
    window._originalConnectionPoint =
      window._originalConnectionPoint || window.ConnectionPoint;

    // 创建一个模拟对象替换原始连接点，包含常用方法以避免TypeError
    const mockConnectionPoint = {
      initialized: true, // 标记为已初始化，防止再次初始化
      init: function () {
        console.log('连接点初始化已被禁用');
      },
      isAvailable: function () {
        return false;
      },
      getVersion: function () {
        return 'disabled';
      },
      // 添加常用方法的空实现
      on: function () {
        console.log('连接点事件监听已被禁用');
      },
      off: function () {
        console.log('连接点事件移除已被禁用');
      },
      emit: function () {
        console.log('连接点事件触发已被禁用');
      },
      sendMessage: function () {
        console.log('连接点消息发送已被禁用');
      },
      syncData: function () {
        console.log('连接点数据同步已被禁用');
      },
      connect: function () {
        console.log('连接点连接已被禁用');
      },
      disconnect: function () {
        console.log('连接点断开已被禁用');
      },
    };

    // 替换全局连接点对象
    window.connectionPoint = mockConnectionPoint;
    window.ConnectionPoint = mockConnectionPoint;

    console.log('已禁用连接点功能');
  }

  // 清理DOM中的连接点元素
  function cleanupConnectionPointElements() {
    const connectionPointSelectors = [
      '.connection-point',
      '.connection-panel',
      '[id*="connection-point"]',
      '[data-connection-point]',
    ];

    connectionPointSelectors.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        element.style.display = 'none';
        element.style.visibility = 'hidden';
        element.style.pointerEvents = 'none';
        console.log('已隐藏连接点DOM元素:', element);
      });
    });
  }

  // 拦截DOMContentLoaded事件，确保在页面脚本执行前禁用连接点
  function interceptDOMContentLoaded() {
    const originalAddEventListener = document.addEventListener;
    const originalAttachEvent = document.attachEvent;

    // 重写addEventListener
    document.addEventListener = function (eventName, callback, options) {
      if (eventName === 'DOMContentLoaded') {
        const wrappedCallback = function (e) {
          // 在回调执行前禁用连接点
          disableConnectionPoint();
          cleanupConnectionPointElements();
          // 执行原始回调
          callback(e);
        };
        return originalAddEventListener.call(
          this,
          eventName,
          wrappedCallback,
          options
        );
      }
      return originalAddEventListener.call(this, eventName, callback, options);
    };

    // 重写attachEvent（IE兼容）
    if (originalAttachEvent) {
      document.attachEvent = function (eventName, callback) {
        if (
          eventName === 'onDOMContentLoaded' ||
          eventName === 'DOMContentLoaded'
        ) {
          const wrappedCallback = function (e) {
            // 在回调执行前禁用连接点
            disableConnectionPoint();
            cleanupConnectionPointElements();
            // 执行原始回调
            callback(e);
          };
          return originalAttachEvent.call(this, eventName, wrappedCallback);
        }
        return originalAttachEvent.call(this, eventName, callback);
      };
    }

    console.log('已拦截DOMContentLoaded事件');
  }

  // 主要初始化函数
  function init() {
    // 立即加载覆盖样式
    loadOverrideStyles();

    // 立即拦截DOMContentLoaded事件
    interceptDOMContentLoaded();

    // 如果DOM已经加载完成，立即执行清理
    if (
      document.readyState === 'complete' ||
      document.readyState === 'interactive'
    ) {
      disableConnectionPoint();
      cleanupConnectionPointElements();
    }

    // 监听页面加载完成事件，确保彻底清理
    window.addEventListener('load', function () {
      setTimeout(function () {
        disableConnectionPoint();
        cleanupConnectionPointElements();
        console.log('product-services.html页面优化完成');
      }, 100); // 小延迟确保所有DOM元素都已创建
    });

    // 定期检查并清理，以防动态添加的连接点元素
    const intervalId = setInterval(function () {
      cleanupConnectionPointElements();
      // 30秒后停止检查
      setTimeout(function () {
        clearInterval(intervalId);
        console.log('停止连接点元素检查');
      }, 30000);
    }, 2000);
  }

  // 立即执行初始化
  init();
})();
