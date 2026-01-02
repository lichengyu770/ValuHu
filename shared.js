// 共享JavaScript功能

// -------------------- API配置与调用 --------------------

// API配置对象
const API_CONFIG = {
  // 是否使用Mock接口
  useMock: true,
  // 真实API基础URL
  realBaseUrl: '/api',
  // Mock API基础URL
  mockBaseUrl: 'http://localhost:3001/api',
  // 超时时间（毫秒）
  timeout: 5000,
};

/**
 * 切换API模式（Mock/真实）
 * @param {boolean} useMock - 是否使用Mock接口
 */
function toggleApiMode(useMock) {
  API_CONFIG.useMock = useMock;
  localStorage.setItem('useMockApi', useMock ? 'true' : 'false');
  // 显示切换结果提示
  const mode = useMock ? 'Mock' : '真实';
  showMessage(`已切换至${mode}接口模式`);
  console.log(`API模式已切换至：${mode}接口`);
}

/**
 * 初始化API配置
 * 从localStorage读取上次的配置
 */
function initApiConfig() {
  const savedMode = localStorage.getItem('useMockApi');
  if (savedMode !== null) {
    API_CONFIG.useMock = savedMode === 'true';
  }
  console.log(`当前API模式：${API_CONFIG.useMock ? 'Mock' : '真实'}接口`);
}

/**
 * 统一API调用函数
 * @param {string} endpoint - 接口路径
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回Promise对象
 */
async function callApi(endpoint, options = {}) {
  // 确定API基础URL
  const baseUrl = API_CONFIG.useMock
    ? API_CONFIG.mockBaseUrl
    : API_CONFIG.realBaseUrl;
  const url = `${baseUrl}${endpoint}`;

  // 设置默认请求选项
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  const requestOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  // 如果有请求体且是对象，转换为JSON字符串
  if (requestOptions.body && typeof requestOptions.body === 'object') {
    requestOptions.body = JSON.stringify(requestOptions.body);
  }

  try {
    // 显示全局loading
    showGlobalLoading();

    // 创建超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    const response = await fetch(url, {
      ...requestOptions,
      signal: controller.signal,
    });

    // 清除超时
    clearTimeout(timeoutId);

    // 隐藏全局loading
    hideGlobalLoading();

    // 检查响应状态
    if (!response.ok) {
      // 尝试解析错误响应
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText };
      }

      throw {
        status: response.status,
        message: errorData.message || `请求失败：${response.status}`,
        data: errorData,
      };
    }

    // 解析响应数据
    const data = await response.json();

    // 验证响应格式
    if (data.code && data.code !== 200) {
      throw {
        status: data.code,
        message: data.message || '请求失败',
        data: data,
      };
    }

    return data;
  } catch (error) {
    // 隐藏全局loading
    hideGlobalLoading();

    // 处理超时错误
    if (error.name === 'AbortError') {
      throw {
        status: 504,
        message: '请求超时，请稍后重试',
      };
    }

    // 重新抛出错误
    throw error;
  }
}

/**
 * 估价接口调用封装
 * @param {Object} params - 估价参数
 * @returns {Promise} - 返回估价结果
 */
async function callEstimateApi(params) {
  return callApi('/estimate', {
    method: 'POST',
    body: params,
  });
}

/**
 * 批量估价接口调用封装
 * @param {Array} requests - 估价请求数组
 * @returns {Promise} - 返回批量估价结果
 */
async function callBatchEstimateApi(requests) {
  return callApi('/estimate/batch', {
    method: 'POST',
    body: { requests },
  });
}

/**
 * 获取当前API模式
 * @returns {boolean} - 当前是否使用Mock接口
 */
function getCurrentApiMode() {
  return API_CONFIG.useMock;
}

// 初始化API配置
initApiConfig();

// -------------------- API配置与调用结束 --------------------

// 页面加载动画
function initPageLoader() {
  // 模拟页面加载
  setTimeout(() => {
    const loader = document.getElementById('pageLoader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => {
        loader.style.display = 'none';
      }, 300);
    }
  }, 800);
}

// 导航菜单切换（移动端）
function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (menuToggle && mobileMenu) {
    // 初始化菜单隐藏状态
    mobileMenu.style.display = 'none';

    menuToggle.addEventListener('click', () => {
      if (mobileMenu.style.display === 'none') {
        // 显示菜单
        mobileMenu.style.display = 'block';
        // 添加延迟确保display生效后再添加active类
        setTimeout(() => {
          mobileMenu.classList.add('active');
        }, 10);
        // 更改图标
        menuToggle.querySelector('i').classList.remove('fa-bars');
        menuToggle.querySelector('i').classList.add('fa-times');
        // 防止背景滚动
        document.body.style.overflow = 'hidden';
        // 记录用户操作
        logUserOperation('导航', '打开移动端菜单');
      } else {
        // 隐藏菜单（带动画）
        mobileMenu.classList.remove('active');
        // 更改图标
        menuToggle.querySelector('i').classList.remove('fa-times');
        menuToggle.querySelector('i').classList.add('fa-bars');
        // 添加延迟确保动画完成后再隐藏
        setTimeout(() => {
          mobileMenu.style.display = 'none';
        }, 300);
        // 恢复背景滚动
        document.body.style.overflow = 'auto';
        // 记录用户操作
        logUserOperation('导航', '关闭移动端菜单');
      }
    });

    // 点击菜单项后关闭菜单
    const menuItems = mobileMenu.querySelectorAll('a');
    menuItems.forEach((item) => {
      item.addEventListener('click', () => {
        if (mobileMenu.style.display === 'block') {
          mobileMenu.classList.remove('active');
          menuToggle.querySelector('i').classList.remove('fa-times');
          menuToggle.querySelector('i').classList.add('fa-bars');
          setTimeout(() => {
            mobileMenu.style.display = 'none';
          }, 300);
          document.body.style.overflow = 'auto';
        }
      });
    });
  }
}

// 模态框通用处理
function initModalHandling() {
  const modals = document.querySelectorAll('.modal');
  const closeButtons = document.querySelectorAll('.close-modal');

  // 关闭按钮事件
  closeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const modal = button.closest('.modal');
      if (modal) {
        modal.style.display = 'none';
      }
    });
  });

  // 点击模态框外部关闭
  window.addEventListener('click', (e) => {
    modals.forEach((modal) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  });

  // ESC键关闭模态框
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modals.forEach((modal) => {
        modal.style.display = 'none';
      });
    }
  });
}

// 返回顶部按钮
function initBackToTop() {
  const backToTopButton = document.getElementById('backToTop');

  if (backToTopButton) {
    // 滚动显示/隐藏返回顶部按钮
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        backToTopButton.style.display = 'flex';
      } else {
        backToTopButton.style.display = 'none';
      }
    });

    // 返回顶部功能
    backToTopButton.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    });
  }
}

// 导航栏滚动效果
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');

  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }
}

// 用户操作日志记录
function logUserOperation(page, action, details = '') {
  // 在实际项目中，这里会发送到服务器记录
  console.log(`[用户操作] 页面: ${page}, 操作: ${action}, 详情: ${details}`);

  // 模拟发送到服务器
  try {
    // 这里仅作为演示，不实际发送
    // fetch('/api/logs', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ page, action, details, timestamp: new Date().toISOString() })
    // });
  } catch (error) {
    console.error('记录用户操作失败:', error);
  }
}

// 统一消息提示
function showMessage(message, type = 'info') {
  // 检查是否已存在消息元素
  let messageElement = document.getElementById('globalMessage');

  if (!messageElement) {
    // 创建消息元素
    messageElement = document.createElement('div');
    messageElement.id = 'globalMessage';
    messageElement.className = 'global-message';
    messageElement.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            border-radius: 6px;
            color: white;
            font-size: 14px;
            z-index: 3000;
            opacity: 0;
            transition: opacity 0.3s;
        `;
    document.body.appendChild(messageElement);
  }

  // 设置消息类型样式
  switch (type) {
    case 'success':
      messageElement.style.backgroundColor = '#52C41A';
      break;
    case 'error':
      messageElement.style.backgroundColor = '#F5222D';
      break;
    case 'warning':
      messageElement.style.backgroundColor = '#FAAD14';
      break;
    case 'info':
    default:
      messageElement.style.backgroundColor = '#1890FF';
      break;
  }

  // 设置消息内容
  messageElement.textContent = message;

  // 显示消息
  messageElement.style.opacity = '1';

  // 3秒后自动隐藏
  setTimeout(() => {
    messageElement.style.opacity = '0';
    setTimeout(() => {
      messageElement.textContent = '';
    }, 300);
  }, 3000);
}

// 统一错误处理
function handleError(error, context = '未知上下文') {
  console.error(`[${context}] 错误:`, error);

  // 显示用户友好的错误消息
  showMessage('操作过程中出现错误，请稍后重试', 'error');

  // 在实际项目中，可以在这里发送错误报告
  try {
    // 这里仅作为演示，不实际发送
    // fetch('/api/errors', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //         context,
    //         error: error.message || 'Unknown error',
    //         stack: error.stack,
    //         timestamp: new Date().toISOString()
    //     })
    // });
  } catch (err) {
    console.error('发送错误报告失败:', err);
  }
}

// 表单提交loading状态管理
function initFormSubmission() {
  // 为所有带有data-submit-form属性的表单添加处理
  const forms = document.querySelectorAll('[data-submit-form]');

  forms.forEach((form) => {
    form.addEventListener('submit', async (e) => {
      // 如果表单有验证属性，先进行验证
      if (
        form.hasAttribute('data-validate') &&
        form.getAttribute('data-validate') === 'true'
      ) {
        const isValid = validateForm(form.id);
        if (!isValid) {
          e.preventDefault();
          return;
        }
      }

      const submitButton = form.querySelector('[type="submit"]');
      if (!submitButton) return;

      // 保存原始按钮文本
      const originalText = submitButton.innerHTML;

      // 获取自定义loading文本或使用默认值
      const loadingText = form.getAttribute('data-loading-text') || '提交中...';

      try {
        // 显示loading状态
        submitButton.disabled = true;
        submitButton.innerHTML = `<span class="loading"></span> ${loadingText}`;

        // 添加全局loading指示器
        showGlobalLoading();

        // 记录表单提交
        logUserOperation(document.title, '表单提交', form.id);

        // 如果是异步提交，等待表单处理完成
        if (
          form.hasAttribute('data-async') &&
          form.getAttribute('data-async') === 'true'
        ) {
          e.preventDefault();

          // 模拟异步请求
          await new Promise((resolve) => setTimeout(resolve, 1500));

          // 隐藏loading状态
          hideGlobalLoading();
          submitButton.innerHTML = originalText;
          submitButton.disabled = false;

          // 显示成功消息
          const successMessage =
            form.getAttribute('data-success-message') || '提交成功！';
          showMessage(successMessage, 'success');

          // 如果有重置属性，重置表单
          if (
            form.hasAttribute('data-reset-on-success') &&
            form.getAttribute('data-reset-on-success') === 'true'
          ) {
            form.reset();
          }
        } else {
          // 对于同步提交，在页面卸载前显示loading
          window.addEventListener('beforeunload', () => {
            showGlobalLoading();
          });
        }
      } catch (error) {
        // 隐藏loading状态
        hideGlobalLoading();
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;

        // 显示错误消息
        const errorMessage =
          form.getAttribute('data-error-message') || '提交失败，请稍后重试';
        showMessage(errorMessage, 'error');

        // 记录错误
        handleError(error, `表单提交 (${form.id})`);
      }
    });
  });
}

// 全局loading指示器
function showGlobalLoading() {
  let loadingOverlay = document.getElementById('globalLoading');

  if (!loadingOverlay) {
    // 创建全局loading元素
    loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'globalLoading';
    loadingOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            backdrop-filter: blur(2px);
        `;

    // 创建loading内容
    const loadingContent = document.createElement('div');
    loadingContent.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
        `;

    // 添加loading动画
    const spinner = document.createElement('div');
    spinner.className = 'loading';
    spinner.style.width = '30px';
    spinner.style.height = '30px';
    spinner.style.borderWidth = '3px';
    spinner.style.borderTopColor = '#007AFF';

    // 添加loading文本
    const loadingText = document.createElement('div');
    loadingText.textContent = '处理中...';
    loadingText.style.cssText = `
            color: #007AFF;
            font-size: 16px;
            font-weight: 500;
        `;

    loadingContent.appendChild(spinner);
    loadingContent.appendChild(loadingText);
    loadingOverlay.appendChild(loadingContent);
    document.body.appendChild(loadingOverlay);
  } else {
    // 显示已存在的loading元素
    loadingOverlay.style.display = 'flex';
  }
}

// 隐藏全局loading指示器
function hideGlobalLoading() {
  const loadingOverlay = document.getElementById('globalLoading');
  if (loadingOverlay) {
    loadingOverlay.style.display = 'none';
  }
}

// 表单通用验证
function validateForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return false;

  let isValid = true;
  const requiredFields = form.querySelectorAll('[required]');

  requiredFields.forEach((field) => {
    if (!field.value.trim()) {
      isValid = false;
      field.classList.add('error');

      // 添加错误提示
      let errorElement = field.parentNode.querySelector('.error-message');
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.style.cssText =
          'color: #F5222D; font-size: 12px; margin-top: 4px;';
        field.parentNode.appendChild(errorElement);
      }
      errorElement.textContent = '此字段不能为空';
    } else {
      field.classList.remove('error');
      const errorElement = field.parentNode.querySelector('.error-message');
      if (errorElement) errorElement.remove();
    }
  });

  return isValid;
}

// 表单字段实时验证
function initRealTimeValidation() {
  const forms = document.querySelectorAll('form');

  forms.forEach((form) => {
    const fields = form.querySelectorAll('[required], [pattern]');

    fields.forEach((field) => {
      // 失去焦点时验证
      field.addEventListener('blur', () => {
        validateField(field);
      });

      // 输入时清除错误提示
      field.addEventListener('input', () => {
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) errorElement.remove();
      });
    });
  });
}

// 验证单个字段
function validateField(field) {
  let isValid = true;
  let errorMessage = '';

  // 必填字段验证
  if (field.hasAttribute('required') && !field.value.trim()) {
    isValid = false;
    errorMessage = '此字段不能为空';
  }

  // 正则表达式验证
  if (isValid && field.hasAttribute('pattern')) {
    const pattern = new RegExp(field.getAttribute('pattern'));
    if (!pattern.test(field.value.trim())) {
      isValid = false;
      errorMessage = field.getAttribute('title') || '格式不正确';
    }
  }

  // 邮箱验证
  if (isValid && field.type === 'email' && field.value.trim()) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(field.value.trim())) {
      isValid = false;
      errorMessage = '请输入有效的邮箱地址';
    }
  }

  // 手机号码验证
  if (isValid && field.type === 'tel' && field.value.trim()) {
    const phonePattern = /^[0-9]{11}$/;
    if (!phonePattern.test(field.value.trim())) {
      isValid = false;
      errorMessage = '请输入有效的手机号码';
    }
  }

  // 显示或清除错误提示
  if (!isValid) {
    field.classList.add('error');
    let errorElement = field.parentNode.querySelector('.error-message');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      errorElement.style.cssText =
        'color: #F5222D; font-size: 12px; margin-top: 4px;';
      field.parentNode.appendChild(errorElement);
    }
    errorElement.textContent = errorMessage;
  } else {
    field.classList.remove('error');
    const errorElement = field.parentNode.querySelector('.error-message');
    if (errorElement) errorElement.remove();
  }

  return isValid;
}

// 页面初始化通用函数
function initSharedFeatures() {
  try {
    initPageLoader();
    initMobileMenu();
    initModalHandling();
    initBackToTop();
    initNavbarScroll();
    initFormSubmission();
    initRealTimeValidation();

    // 记录页面访问
    const pageTitle = document.title;
    logUserOperation(pageTitle, '页面访问');
  } catch (error) {
    handleError(error, '初始化共享功能');
  }
}

// 当DOM加载完成后初始化共享功能
document.addEventListener('DOMContentLoaded', initSharedFeatures);
