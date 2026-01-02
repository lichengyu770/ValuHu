// 连接点优化脚本
// 在不修改index.html的情况下禁用并隐藏连接点功能

(function () {
  // 动态加载覆盖样式以隐藏连接点UI
  function loadOverrideStyles() {
    // 检查样式是否已加载
    if (!document.querySelector('link[href="css/hide-connection-point.css"]')) {
      const styleLink = document.createElement('link');
      styleLink.rel = 'stylesheet';
      styleLink.href = 'css/hide-connection-point.css';
      styleLink.id = 'hide-connection-point-styles';
      document.head.appendChild(styleLink);
      console.log('已加载连接点覆盖样式');
    }
  }

  // 禁用连接点初始化
  function disableConnectionPoint() {
    // 保存原始的connectionPoint对象（如果存在）
    if (window.connectionPoint) {
      window._originalConnectionPoint = window.connectionPoint;

      // 创建一个模拟对象替换原始连接点，包含常用方法以避免TypeError
      window.connectionPoint = {
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

      // 同时处理ConnectionPoint对象（大写开头的版本）
      window.ConnectionPoint = window.ConnectionPoint || window.connectionPoint;
      console.log('已禁用连接点功能');
    }
  }

  // 拦截DOMContentLoaded事件监听器，阻止连接点初始化
  function interceptDomContentLoaded() {
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (
      type,
      listener,
      options
    ) {
      if (type === 'DOMContentLoaded') {
        // 包装监听器以过滤连接点相关代码
        const wrappedListener = function (event) {
          try {
            // 执行原始监听器，但不允许连接点初始化
            const originalCP = window.connectionPoint;
            const originalConnectionPoint = window.ConnectionPoint;

            // 临时替换以防止初始化
            window.connectionPoint = {
              initialized: true,
              init: function () {},
            };
            window.ConnectionPoint = {
              init: function () {},
            };

            // 执行原始监听器
            listener.call(this, event);

            // 恢复原始对象（如果需要）
            // 这里不恢复，因为我们要保持禁用状态
          } catch (error) {
            console.error('执行DOMContentLoaded监听器时出错:', error);
          }
        };
        return originalAddEventListener.call(
          this,
          type,
          wrappedListener,
          options
        );
      }
      return originalAddEventListener.call(this, type, listener, options);
    };
  }

  // 立即执行优化操作
  function optimize() {
    console.log('开始优化连接点...');

    // 立即加载覆盖样式
    loadOverrideStyles();

    // 立即禁用连接点
    disableConnectionPoint();

    // 拦截DOMContentLoaded事件
    interceptDomContentLoaded();

    // 检查是否已创建了连接点UI元素，如果已创建则移除
    setTimeout(function () {
      const connectionElements = document.querySelectorAll(
        '#connection-point-container, .connection-point, #connection-panel, .connection-panel, #connection-main-btn'
      );
      connectionElements.forEach((el) => el.remove());
      console.log('已清理页面上的连接点UI元素');
    }, 0);
  }

  // 立即执行优化
  optimize();
})();
