// 错误处理器与用户体验管理器 - 数智估价核心引擎

/**
 * 错误处理器类
 * 负责统一错误捕获、分类、处理及用户反馈
 */
class ErrorHandler {
  constructor() {
    // 错误配置
    this.config = {
      maxErrorLogSize: 100,
      autoReportThreshold: 5,
      reportUrl: '/api/error-report',
      enableConsoleLogging: true,
      enableUserNotifications: true,
      enableTelemetry: true,
    };

    // 错误日志
    this.errorLog = [];
    // 错误计数器
    this.errorCount = {};
    // 初始化状态
    this.initialized = false;
    // 依赖组件引用
    this.dependencies = {};

    // 初始化
    this.initialize();
  }

  /**
   * 初始化错误处理器
   */
  initialize() {
    if (this.initialized) return;

    // 设置全局错误监听
    this.setupGlobalErrorHandlers();

    // 设置Promise错误监听
    this.setupPromiseErrorHandler();

    // 设置资源加载错误监听
    this.setupResourceErrorHandler();

    // 设置未捕获的rejection监听
    this.setupUnhandledRejectionHandler();

    this.initialized = true;
    console.log('错误处理器已初始化');
  }

  /**
   * 设置全局错误处理器
   */
  setupGlobalErrorHandlers() {
    const originalWindowError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      this.handleError(error || new Error(message), {
        source,
        lineno,
        colno,
        type: 'global',
        timestamp: Date.now(),
      });

      // 调用原始处理器
      if (originalWindowError) {
        return originalWindowError(message, source, lineno, colno, error);
      }
      return true; // 阻止默认错误处理
    };
  }

  /**
   * 设置Promise错误处理器
   */
  setupPromiseErrorHandler() {
    const originalOnunhandledrejection = window.onunhandledrejection;
    window.onunhandledrejection = (event) => {
      const reason = event.reason || new Error('Unhandled Promise rejection');
      this.handleError(reason, {
        type: 'promise',
        timestamp: Date.now(),
      });

      // 调用原始处理器
      if (originalOnunhandledrejection) {
        originalOnunhandledrejection(event);
      }

      event.preventDefault(); // 阻止默认行为
    };
  }

  /**
   * 设置资源加载错误处理器
   */
  setupResourceErrorHandler() {
    document.addEventListener(
      'error',
      (event) => {
        const target = event.target;
        if (
          target &&
          (target.tagName === 'IMG' ||
            target.tagName === 'SCRIPT' ||
            target.tagName === 'LINK')
        ) {
          this.handleError(
            new Error(`资源加载失败: ${target.src || target.href}`),
            {
              type: 'resource',
              resourceType: target.tagName.toLowerCase(),
              resourceUrl: target.src || target.href,
              timestamp: Date.now(),
            }
          );
        }
      },
      true
    );
  }

  /**
   * 设置未捕获的rejection处理器
   */
  setupUnhandledRejectionHandler() {
    process &&
      process.on &&
      process.on('unhandledRejection', (reason, promise) => {
        this.handleError(reason || new Error('Node.js unhandled rejection'), {
          type: 'node-rejection',
          timestamp: Date.now(),
        });
      });
  }

  /**
   * 处理错误
   * @param {Error} error 错误对象
   * @param {object} context 错误上下文
   */
  handleError(error, context = {}) {
    // 规范化错误
    const normalizedError = this.normalizeError(error);

    // 分类错误
    const errorInfo = this.classifyError(normalizedError, context);

    // 记录错误
    this.logError(errorInfo);

    // 显示用户通知
    if (this.config.enableUserNotifications) {
      this.notifyUser(errorInfo);
    }

    // 可能的自动报告
    this.checkAndReport(errorInfo);

    return errorInfo;
  }

  /**
   * 规范化错误对象
   * @param {*} error 原始错误
   * @returns {Error} 规范化的错误对象
   */
  normalizeError(error) {
    if (error instanceof Error) return error;

    // 处理字符串错误
    if (typeof error === 'string') {
      return new Error(error);
    }

    // 处理对象错误
    if (typeof error === 'object' && error !== null) {
      const errorObj = new Error(error.message || '未知错误');
      errorObj.name = error.name || 'Error';
      errorObj.stack = error.stack;
      errorObj.code = error.code;
      errorObj.status = error.status;
      return errorObj;
    }

    // 默认错误
    return new Error('未知错误类型');
  }

  /**
   * 分类错误
   * @param {Error} error 错误对象
   * @param {object} context 上下文信息
   * @returns {object} 错误信息对象
   */
  classifyError(error, context) {
    let severity = 'error';
    let category = 'unknown';
    let displayMessage = '发生错误，请稍后再试';
    let recoverable = true;

    // 根据错误类型分类
    if (error.name === 'TypeError') {
      category = 'type';
      severity = 'error';
      displayMessage = '数据类型错误，请检查操作';
    } else if (error.name === 'SyntaxError') {
      category = 'syntax';
      severity = 'error';
      displayMessage = '系统内部错误，请联系技术支持';
    } else if (error.name === 'ReferenceError') {
      category = 'reference';
      severity = 'error';
      displayMessage = '系统资源未找到，请刷新页面重试';
    } else if (error.name === 'RangeError') {
      category = 'range';
      severity = 'warning';
      displayMessage = '数值范围错误，请检查输入';
    } else if (
      error.code === 'NETWORK_ERROR' ||
      error.message.includes('网络') ||
      error.message.includes('Network')
    ) {
      category = 'network';
      severity = 'warning';
      displayMessage = '网络连接失败，请检查网络设置';
    } else if (
      error.code === 'PERMISSION_DENIED' ||
      error.message.includes('权限') ||
      error.message.includes('Permission')
    ) {
      category = 'permission';
      severity = 'warning';
      displayMessage = '权限不足，请重新登录';
    } else if (error.status === 401 || error.message.includes('未授权')) {
      category = 'auth';
      severity = 'warning';
      displayMessage = '登录已过期，请重新登录';
    } else if (error.status === 403) {
      category = 'forbidden';
      severity = 'warning';
      displayMessage = '您无权执行此操作';
    } else if (error.status === 404) {
      category = 'notfound';
      severity = 'info';
      displayMessage = '请求的资源不存在';
    } else if (error.status >= 500) {
      category = 'server';
      severity = 'error';
      displayMessage = '服务器错误，请稍后再试';
      recoverable = false;
    }

    // 特殊上下文处理
    if (context.type === 'resource') {
      category = 'resource';
      severity = 'warning';
      displayMessage = '部分资源加载失败，可能影响显示效果';
    }

    return {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: context.timestamp || Date.now(),
      severity,
      category,
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
      status: error.status,
      displayMessage,
      recoverable,
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        pageTitle: document.title,
        ...context,
      },
    };
  }

  /**
   * 记录错误到日志
   * @param {object} errorInfo 错误信息
   */
  logError(errorInfo) {
    // 更新错误计数
    this.errorCount[errorInfo.category] =
      (this.errorCount[errorInfo.category] || 0) + 1;

    // 添加到日志
    this.errorLog.push(errorInfo);

    // 限制日志大小
    if (this.errorLog.length > this.config.maxErrorLogSize) {
      this.errorLog.shift();
    }

    // 控制台日志
    if (this.config.enableConsoleLogging) {
      const consoleMethod =
        errorInfo.severity === 'error'
          ? console.error
          : errorInfo.severity === 'warning'
            ? console.warn
            : console.info;

      consoleMethod(
        `[${errorInfo.severity.toUpperCase()}] [${errorInfo.category}] ${errorInfo.displayMessage}`
      );
      if (errorInfo.severity === 'error') {
        consoleMethod(errorInfo.stack || errorInfo.message);
      }
    }
  }

  /**
   * 通知用户
   * @param {object} errorInfo 错误信息
   */
  notifyUser(errorInfo) {
    // 检查是否需要显示通知
    if (errorInfo.severity === 'info') return;

    // 尝试使用组件库显示消息
    if (window.ComponentLibrary) {
      window.ComponentLibrary.showMessage({
        text: errorInfo.displayMessage,
        type: errorInfo.severity,
        duration: errorInfo.severity === 'error' ? 5000 : 3000,
      });
    } else if (window.showMessage) {
      // 尝试使用共享的showMessage函数
      window.showMessage(errorInfo.displayMessage, errorInfo.severity);
    } else {
      // 后备方案：使用alert
      if (errorInfo.severity === 'error') {
        alert(errorInfo.displayMessage);
      }
    }

    // 对于不可恢复的错误，显示更严重的提示
    if (!errorInfo.recoverable) {
      this.showCriticalErrorDialog(errorInfo);
    }
  }

  /**
   * 显示严重错误对话框
   * @param {object} errorInfo 错误信息
   */
  showCriticalErrorDialog(errorInfo) {
    // 尝试使用组件库显示模态框
    if (window.ComponentLibrary) {
      const modal = window.ComponentLibrary.createModal({
        title: '严重错误',
        content: `
                    <p>${errorInfo.displayMessage}</p>
                    <p style="color: #666; font-size: 14px; margin-top: 8px;">错误ID: ${errorInfo.id}</p>
                    <p style="color: #666; font-size: 14px; margin-top: 4px;">建议刷新页面或稍后再试</p>
                `,
        footer: `
                    <div style="display: flex; gap: 12px; justify-content: flex-end;">
                        ${
                          window.ComponentLibrary.createButton({
                            type: 'primary',
                            text: '刷新页面',
                            onClick: () => window.location.reload(),
                          }).outerHTML
                        }
                        ${
                          window.ComponentLibrary.createButton({
                            type: 'secondary',
                            text: '稍后再试',
                            onClick: () =>
                              window.ComponentLibrary.hideModal(modal.id),
                          }).outerHTML
                        }
                    </div>
                `,
      });

      document.body.appendChild(modal);
      window.ComponentLibrary.showModal(modal.id);
    } else {
      // 后备方案
      if (confirm(`${errorInfo.displayMessage}\n\n建议刷新页面，是否继续？`)) {
        window.location.reload();
      }
    }
  }

  /**
   * 检查并报告错误
   * @param {object} errorInfo 错误信息
   */
  checkAndReport(errorInfo) {
    // 只有在启用遥测的情况下才报告
    if (!this.config.enableTelemetry) return;

    // 只有错误级别才报告
    if (errorInfo.severity !== 'error') return;

    // 检查是否达到报告阈值
    if (this.errorCount[errorInfo.category] <= this.config.autoReportThreshold)
      return;

    // 异步报告错误
    this.reportError(errorInfo);
  }

  /**
   * 报告错误到服务器
   * @param {object} errorInfo 错误信息
   */
  async reportError(errorInfo) {
    try {
      // 准备报告数据
      const reportData = {
        error: {
          id: errorInfo.id,
          name: errorInfo.name,
          message: errorInfo.message,
          category: errorInfo.category,
          stack: errorInfo.stack,
        },
        context: {
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          sessionId: sessionStorage.getItem('dataManagerSessionId'),
          ...errorInfo.context,
        },
      };

      // 发送报告
      const response = await fetch(this.config.reportUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
        credentials: 'include',
      });

      if (!response.ok) {
        console.warn('错误报告发送失败:', response.status);
      }
    } catch (reportError) {
      console.warn('错误报告过程出错:', reportError);
    }
  }

  /**
   * 获取错误日志
   * @param {object} options 筛选选项
   * @returns {Array} 错误日志数组
   */
  getErrorLog(options = {}) {
    const { category, severity, limit = 50 } = options;

    let filtered = [...this.errorLog];

    if (category) {
      filtered = filtered.filter((error) => error.category === category);
    }

    if (severity) {
      filtered = filtered.filter((error) => error.severity === severity);
    }

    // 按时间倒序排序
    filtered.sort((a, b) => b.timestamp - a.timestamp);

    return filtered.slice(0, limit);
  }

  /**
   * 清除错误日志
   */
  clearErrorLog() {
    this.errorLog = [];
    this.errorCount = {};
  }

  /**
   * 设置配置
   * @param {object} newConfig 新配置
   */
  setConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 包装异步函数，添加错误处理
   * @param {Function} fn 原始函数
   * @param {object} options 选项
   * @returns {Function} 包装后的函数
   */
  wrapAsync(fn, options = {}) {
    const {
      showLoading = false,
      showSuccess = true,
      successMessage = '操作成功',
    } = options;

    return async function (...args) {
      let loadingElement = null;

      try {
        // 显示加载状态
        if (showLoading && window.ComponentLibrary) {
          loadingElement = window.ComponentLibrary.createLoader({
            text: options.loadingText || '处理中...',
            overlay: true,
          });
          document.body.appendChild(loadingElement);
        }

        // 执行原始函数
        const result = await fn.apply(this, args);

        // 显示成功消息
        if (showSuccess) {
          if (window.ComponentLibrary) {
            window.ComponentLibrary.showMessage({
              text: successMessage,
              type: 'success',
            });
          } else if (window.showMessage) {
            window.showMessage(successMessage, 'success');
          }
        }

        return result;
      } catch (error) {
        // 处理错误
        this.handleError(error, { functionName: fn.name });
        throw error; // 重新抛出以便调用者可以处理
      } finally {
        // 清理加载状态
        if (loadingElement && loadingElement.parentNode) {
          loadingElement.parentNode.removeChild(loadingElement);
        }
      }
    };
  }

  /**
   * 创建安全的DOM操作包装器
   * @param {Function} fn DOM操作函数
   * @returns {Function} 安全的操作函数
   */
  safeDOMOperation(fn) {
    return function (...args) {
      try {
        return fn.apply(this, args);
      } catch (error) {
        this.handleError(error, { operation: 'dom', functionName: fn.name });
        return null;
      }
    };
  }

  /**
   * 创建安全的API调用包装器
   * @param {Function} apiCall API调用函数
   * @param {object} options 选项
   * @returns {Function} 安全的API调用
   */
  safeApiCall(apiCall, options = {}) {
    const defaultOptions = {
      retryAttempts: 2,
      retryDelay: 1000,
      timeout: 30000,
      showLoading: true,
    };

    const mergedOptions = { ...defaultOptions, ...options };

    return async function (...args) {
      let lastError;

      for (let attempt = 0; attempt <= mergedOptions.retryAttempts; attempt++) {
        try {
          // 设置超时
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(
              () => reject(new Error('请求超时')),
              mergedOptions.timeout
            );
          });

          // 执行API调用，带超时控制
          const result = await Promise.race([
            apiCall.apply(this, args),
            timeoutPromise,
          ]);

          return result;
        } catch (error) {
          lastError = error;

          // 只在网络错误时重试
          if (
            error.code !== 'NETWORK_ERROR' &&
            !error.message.includes('网络') &&
            !error.message.includes('Network') &&
            !error.message.includes('timeout')
          ) {
            break;
          }

          // 如果不是最后一次尝试，则等待后重试
          if (attempt < mergedOptions.retryAttempts) {
            await new Promise((resolve) =>
              setTimeout(
                resolve,
                mergedOptions.retryDelay * Math.pow(2, attempt)
              )
            );
          }
        }
      }

      // 所有尝试都失败，处理错误
      this.handleError(lastError, {
        apiCall: true,
        retryAttempts: mergedOptions.retryAttempts,
      });
      throw lastError;
    };
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

    // 注册错误处理功能
    connectionManager.registerFeature('error', {
      handle: this.handleError.bind(this),
      getLog: this.getErrorLog.bind(this),
      clearLog: this.clearErrorLog.bind(this),
      setConfig: this.setConfig.bind(this),
      wrapAsync: this.wrapAsync.bind(this),
      safeDOMOperation: this.safeDOMOperation.bind(this),
      safeApiCall: this.safeApiCall.bind(this),
    });

    console.log('错误处理器已成功注册到连接管理器');
  }

  /**
   * 设置依赖项
   * @param {object} deps 依赖项
   */
  setDependencies(deps) {
    this.dependencies = { ...this.dependencies, ...deps };
  }

  /**
   * 创建操作确认对话框
   * @param {object} options 选项
   * @returns {Promise} 确认结果Promise
   */
  confirm(options) {
    return new Promise((resolve) => {
      const {
        title = '确认操作',
        message = '确定要执行此操作吗？',
        confirmText = '确定',
        cancelText = '取消',
        confirmType = 'primary',
      } = options || {};

      // 尝试使用组件库
      if (window.ComponentLibrary) {
        const modal = window.ComponentLibrary.createModal({
          title,
          content: `<p>${message}</p>`,
          footer: `
                        <div style="display: flex; gap: 12px; justify-content: flex-end;">
                            ${
                              window.ComponentLibrary.createButton({
                                type: 'secondary',
                                text: cancelText,
                                onClick: () => {
                                  window.ComponentLibrary.hideModal(modal.id);
                                  resolve(false);
                                },
                              }).outerHTML
                            }
                            ${
                              window.ComponentLibrary.createButton({
                                type: confirmType,
                                text: confirmText,
                                onClick: () => {
                                  window.ComponentLibrary.hideModal(modal.id);
                                  resolve(true);
                                },
                              }).outerHTML
                            }
                        </div>
                    `,
        });

        document.body.appendChild(modal);
        window.ComponentLibrary.showModal(modal.id);
      } else {
        // 后备方案
        resolve(confirm(`${message}\n\n点击确定继续，取消中止操作。`));
      }
    });
  }

  /**
   * 显示进度指示器
   * @param {object} options 选项
   * @returns {object} 进度控制器
   */
  showProgress(options = {}) {
    const {
      title = '处理中',
      message = '',
      totalSteps = 100,
      autoClose = true,
    } = options;

    let progressBar, progressText, modal;
    let currentStep = 0;

    // 尝试使用组件库
    if (window.ComponentLibrary) {
      modal = window.ComponentLibrary.createModal({
        title,
        showClose: false,
        content: `
                    ${message ? `<p>${message}</p>` : ''}
                    <div class="progress-container" style="margin-top: 16px;">
                        <div class="progress-bar" style="
                            height: 8px;
                            background-color: #E8E8E8;
                            border-radius: 4px;
                            overflow: hidden;
                        ">
                            <div class="progress-fill" style="
                                height: 100%;
                                background-color: #007AFF;
                                width: 0%;
                                transition: width 0.3s ease;
                            "></div>
                        </div>
                        <div class="progress-text" style="
                            font-size: 14px;
                            color: #666;
                            margin-top: 8px;
                            text-align: center;
                        ">0%</div>
                    </div>
                `,
      });

      document.body.appendChild(modal);
      window.ComponentLibrary.showModal(modal.id);

      progressBar = modal.querySelector('.progress-fill');
      progressText = modal.querySelector('.progress-text');
    }

    // 进度控制器
    const controller = {
      // 更新进度
      update: (step, message) => {
        currentStep = Math.max(0, Math.min(step, totalSteps));
        const percentage = Math.round((currentStep / totalSteps) * 100);

        if (progressBar) {
          progressBar.style.width = `${percentage}%`;
        }
        if (progressText) {
          progressText.textContent = `${percentage}%`;
        }

        if (message && modal) {
          const messageEl = modal.querySelector('p');
          if (messageEl) {
            messageEl.textContent = message;
          }
        }
      },

      // 增加进度
      increment: (amount = 1, message) => {
        this.update(currentStep + amount, message);
      },

      // 完成进度
      complete: (message = '完成') => {
        this.update(totalSteps, message);

        if (autoClose) {
          setTimeout(() => {
            this.close();
          }, 500);
        }
      },

      // 关闭进度条
      close: () => {
        if (modal && window.ComponentLibrary) {
          window.ComponentLibrary.hideModal(modal.id);
          setTimeout(() => {
            if (modal.parentNode) {
              modal.parentNode.removeChild(modal);
            }
          }, 300);
        }
      },
    };

    return controller;
  }
}

// 创建错误处理器实例
const errorHandler = new ErrorHandler();

// 自动注册到连接管理器（如果存在）
if (window.ConnectionManager) {
  errorHandler.registerToConnectionManager(window.ConnectionManager);
} else {
  // 监听连接管理器加载
  window.addEventListener('connection.initialized', (event) => {
    if (window.ConnectionManager) {
      errorHandler.registerToConnectionManager(window.ConnectionManager);
    }
  });
}

// 导出到全局
export default errorHandler;

// 为了兼容不使用ES模块的环境
if (typeof window !== 'undefined') {
  window.ErrorHandler = errorHandler;

  // 替换全局的handleError函数（如果存在）
  if (window.handleError) {
    const originalHandleError = window.handleError;
    window.handleError = (error, context) => {
      originalHandleError(error, context);
      errorHandler.handleError(error, context);
    };
  } else {
    window.handleError = errorHandler.handleError.bind(errorHandler);
  }
}
