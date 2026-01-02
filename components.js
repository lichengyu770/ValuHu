// 统一组件库 - 数智估价核心引擎

/**
 * 组件库主类
 * 提供各种可复用的UI组件
 */
class ComponentLibrary {
  constructor() {
    // 存储已创建的组件实例
    this.instances = {};
    // 组件计数器
    this.counter = 0;
  }

  /**
   * 生成唯一ID
   * @param {string} prefix 前缀
   * @returns {string} 唯一ID
   */
  generateId(prefix = 'component') {
    return `${prefix}-${Date.now()}-${this.counter++}`;
  }

  /**
   * 创建按钮组件
   * @param {object} options 配置选项
   * @returns {HTMLElement} 按钮元素
   */
  createButton(options = {}) {
    const {
      type = 'primary', // primary, secondary, success, warning, danger
      size = 'medium', // small, medium, large
      text = '按钮',
      icon = '',
      block = false,
      disabled = false,
      onClick = null,
      id = this.generateId('btn'),
    } = options;

    const button = document.createElement('button');
    button.id = id;
    button.className = `btn btn-${type}`;
    button.disabled = disabled;

    // 设置尺寸
    if (size !== 'medium') {
      button.classList.add(`btn-${size}`);
    }

    // 设置全宽
    if (block) {
      button.classList.add('btn-block-mobile');
    }

    // 设置内容
    let content = text;
    if (icon) {
      content = `<i class="fas ${icon}"></i> ${text}`;
    }
    button.innerHTML = content;

    // 设置点击事件
    if (onClick && typeof onClick === 'function') {
      button.addEventListener('click', onClick);
    }

    return button;
  }

  /**
   * 创建卡片组件
   * @param {object} options 配置选项
   * @returns {HTMLElement} 卡片元素
   */
  createCard(options = {}) {
    const {
      title = '',
      subtitle = '',
      content = '',
      footer = '',
      actions = [],
      className = '',
      id = this.generateId('card'),
    } = options;

    const card = document.createElement('div');
    card.id = id;
    card.className = `card ${className}`;

    let html = '';

    // 卡片头部
    if (title || subtitle) {
      html += '<div class="card-header">';
      if (title) {
        html += `<h3 class="card-title">${title}</h3>`;
      }
      if (subtitle) {
        html += `<p class="card-subtitle">${subtitle}</p>`;
      }
      html += '</div>';
    }

    // 卡片内容
    html += '<div class="card-body">';
    html += content;
    html += '</div>';

    // 卡片操作按钮
    if (actions && actions.length > 0) {
      html +=
        '<div class="card-actions" style="display: flex; gap: 12px; margin-top: 16px; justify-content: flex-end;">';
      actions.forEach((action) => {
        if (action instanceof HTMLElement) {
          setTimeout(() => {
            const actionContainer = card.querySelector('.card-actions');
            if (actionContainer) {
              actionContainer.appendChild(action);
            }
          }, 0);
        } else {
          const btn = this.createButton(action);
          html += btn.outerHTML;
        }
      });
      html += '</div>';
    }

    // 卡片底部
    if (footer) {
      html += '<div class="card-footer">';
      html += footer;
      html += '</div>';
    }

    card.innerHTML = html;
    return card;
  }

  /**
   * 创建模态框组件
   * @param {object} options 配置选项
   * @returns {HTMLElement} 模态框元素
   */
  createModal(options = {}) {
    const {
      title = '提示',
      content = '',
      width = '400px',
      footer = null,
      showClose = true,
      onClose = null,
      id = this.generateId('modal'),
    } = options;

    const modal = document.createElement('div');
    modal.id = id;
    modal.className = 'modal';
    modal.style.display = 'none';

    let footerHtml = '';
    if (footer) {
      if (footer instanceof HTMLElement) {
        footerHtml = footer.outerHTML;
      } else {
        footerHtml = footer;
      }
    } else {
      // 默认底部按钮
      footerHtml = `
                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                    ${this.createButton({ type: 'secondary', text: '取消', onClick: () => this.hideModal(id) }).outerHTML}
                    ${this.createButton({ type: 'primary', text: '确定' }).outerHTML}
                </div>
            `;
    }

    modal.innerHTML = `
            <div class="modal-content" style="max-width: ${width};">
                ${showClose ? `<span class="close-modal" data-modal-id="${id}">&times;</span>` : ''}
                <h3 class="modal-title">${title}</h3>
                <div class="modal-body">${content}</div>
                ${footerHtml}
            </div>
        `;

    // 添加关闭事件
    if (showClose) {
      const closeBtn = modal.querySelector('.close-modal');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          this.hideModal(id);
          if (onClose && typeof onClose === 'function') {
            onClose();
          }
        });
      }
    }

    // ESC键关闭
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideModal(id);
        if (onClose && typeof onClose === 'function') {
          onClose();
        }
      }
    });

    // 点击遮罩关闭
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.hideModal(id);
        if (onClose && typeof onClose === 'function') {
          onClose();
        }
      }
    });

    return modal;
  }

  /**
   * 显示模态框
   * @param {string} modalId 模态框ID
   */
  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden'; // 防止背景滚动
    }
  }

  /**
   * 隐藏模态框
   * @param {string} modalId 模态框ID
   */
  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = ''; // 恢复背景滚动
    }
  }

  /**
   * 创建表单组组件
   * @param {object} options 配置选项
   * @returns {HTMLElement} 表单组元素
   */
  createFormGroup(options = {}) {
    const {
      label = '',
      type = 'text', // text, email, password, select, textarea, checkbox, radio
      name = '',
      id = this.generateId('input'),
      placeholder = '',
      value = '',
      options = [],
      required = false,
      disabled = false,
      helpText = '',
      errorText = '',
      className = '',
    } = options;

    const formGroup = document.createElement('div');
    formGroup.className = `form-group ${className}`;
    if (errorText) {
      formGroup.classList.add('has-error');
    }

    let html = '';

    // 添加标签
    if (label) {
      html += `<label for="${id}" class="form-label">${label}${required ? ' *' : ''}</label>`;
    }

    // 添加表单控件
    switch (type) {
      case 'textarea':
        html += `<textarea id="${id}" name="${name}" placeholder="${placeholder}" ${disabled ? 'disabled' : ''} ${required ? 'required' : ''} rows="3">${value}</textarea>`;
        break;

      case 'select':
        html += `<select id="${id}" name="${name}" ${disabled ? 'disabled' : ''} ${required ? 'required' : ''}>`;
        options.forEach((option) => {
          const selected = option.value === value ? 'selected' : '';
          html += `<option value="${option.value}" ${selected}>${option.label}</option>`;
        });
        html += `</select>`;
        break;

      case 'checkbox':
      case 'radio':
        html += `<div class="form-check">`;
        html += `<input type="${type}" id="${id}" name="${name}" value="${value}" ${disabled ? 'disabled' : ''} ${required ? 'required' : ''}>`;
        html += `<label for="${id}" class="form-check-label">${label}</label>`;
        html += `</div>`;
        break;

      default:
        html += `<input type="${type}" id="${id}" name="${name}" placeholder="${placeholder}" value="${value}" ${disabled ? 'disabled' : ''} ${required ? 'required' : ''}>`;
    }

    // 添加帮助文本
    if (helpText) {
      html += `<small class="form-text">${helpText}</small>`;
    }

    // 添加错误文本
    if (errorText) {
      html += `<small class="invalid-feedback">${errorText}</small>`;
    }

    formGroup.innerHTML = html;
    return formGroup;
  }

  /**
   * 创建完整表单
   * @param {object} options 配置选项
   * @returns {HTMLElement} 表单元素
   */
  createForm(options = {}) {
    const {
      fields = [],
      onSubmit = null,
      id = this.generateId('form'),
      className = '',
      submitButtonText = '提交',
      cancelButtonText = null,
    } = options;

    const form = document.createElement('form');
    form.id = id;
    form.className = className;

    // 添加表单字段
    fields.forEach((field) => {
      form.appendChild(this.createFormGroup(field));
    });

    // 添加按钮区域
    if (submitButtonText || cancelButtonText) {
      const buttonGroup = document.createElement('div');
      buttonGroup.style.display = 'flex';
      buttonGroup.style.gap = '12px';
      buttonGroup.style.justifyContent = 'flex-end';
      buttonGroup.style.marginTop = '24px';

      if (cancelButtonText) {
        const cancelBtn = this.createButton({
          type: 'secondary',
          text: cancelButtonText,
          onClick: () => form.reset(),
        });
        buttonGroup.appendChild(cancelBtn);
      }

      if (submitButtonText) {
        const submitBtn = this.createButton({
          type: 'primary',
          text: submitButtonText,
        });
        submitBtn.type = 'submit';
        buttonGroup.appendChild(submitBtn);
      }

      form.appendChild(buttonGroup);
    }

    // 添加提交事件
    if (onSubmit && typeof onSubmit === 'function') {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
          data[key] = value;
        });
        onSubmit(data);
      });
    }

    return form;
  }

  /**
   * 创建导航菜单组件
   * @param {object} options 配置选项
   * @returns {HTMLElement} 导航菜单元素
   */
  createNavigation(options = {}) {
    const {
      items = [],
      currentPath = '',
      className = '',
      type = 'horizontal', // horizontal, vertical, mobile
    } = options;

    const nav = document.createElement('nav');
    nav.className = `nav ${type}-nav ${className}`;

    let html = '';

    if (type === 'mobile') {
      html += '<ul>';
    }

    items.forEach((item) => {
      const isActive = item.path === currentPath;
      const activeClass = isActive ? 'active' : '';

      if (type === 'mobile') {
        html += `<li><a href="${item.path}" class="nav-link ${activeClass}">${item.text}</a></li>`;
      } else {
        html += `<a href="${item.path}" class="nav-link ${activeClass}">${item.text}</a>`;
      }
    });

    if (type === 'mobile') {
      html += '</ul>';
    }

    nav.innerHTML = html;
    return nav;
  }

  /**
   * 创建标签组件
   * @param {object} options 配置选项
   * @returns {HTMLElement} 标签元素
   */
  createTag(options = {}) {
    const {
      text = '标签',
      type = 'default', // default, primary, success, warning, danger
      closable = false,
      onClose = null,
      id = this.generateId('tag'),
    } = options;

    const tag = document.createElement('span');
    tag.id = id;
    tag.className = `tag ${type !== 'default' ? `tag-${type}` : ''}`;

    let html = text;
    if (closable) {
      html += `<button type="button" class="tag-close" style="background: none; border: none; margin-left: 6px; cursor: pointer; color: inherit; font-size: 12px;">×</button>`;
    }

    tag.innerHTML = html;

    if (closable && onClose && typeof onClose === 'function') {
      const closeBtn = tag.querySelector('.tag-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          onClose();
        });
      }
    }

    return tag;
  }

  /**
   * 创建加载动画组件
   * @param {object} options 配置选项
   * @returns {HTMLElement} 加载动画元素
   */
  createLoader(options = {}) {
    const {
      text = '加载中...',
      size = 'medium', // small, medium, large
      overlay = false,
      id = this.generateId('loader'),
    } = options;

    const loader = document.createElement('div');
    loader.id = id;

    if (overlay) {
      loader.className = 'page-loader';
    } else {
      loader.className = 'loading-container';
      loader.style.display = 'inline-flex';
      loader.style.alignItems = 'center';
      loader.style.gap = '8px';
    }

    let spinnerSize = '20px';
    let textSize = '14px';

    if (size === 'small') {
      spinnerSize = '16px';
      textSize = '12px';
    } else if (size === 'large') {
      spinnerSize = '32px';
      textSize = '16px';
    }

    const html = `
            <div class="loading-spinner" style="width: ${spinnerSize}; height: ${spinnerSize};"></div>
            ${text ? `<span style="font-size: ${textSize};">${text}</span>` : ''}
        `;

    loader.innerHTML = html;
    return loader;
  }

  /**
   * 创建分页组件
   * @param {object} options 配置选项
   * @returns {HTMLElement} 分页元素
   */
  createPagination(options = {}) {
    const {
      total = 0,
      pageSize = 10,
      current = 1,
      onChange = null,
      id = this.generateId('pagination'),
    } = options;

    const pagination = document.createElement('div');
    pagination.id = id;
    pagination.className = 'pagination';

    const totalPages = Math.ceil(total / pageSize);
    if (totalPages <= 1) {
      return pagination; // 不需要分页
    }

    let html = '';

    // 上一页
    const prevDisabled = current === 1 ? 'disabled' : '';
    html += `<a href="#" class="page-link ${prevDisabled}" data-page="${current - 1}">&laquo;</a>`;

    // 页码
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= current - 1 && i <= current + 1)
      ) {
        const activeClass = i === current ? 'active' : '';
        html += `<a href="#" class="page-link ${activeClass}" data-page="${i}">${i}</a>`;
      } else if (i === current - 2 || i === current + 2) {
        html += `<span class="page-link">...</span>`;
      }
    }

    // 下一页
    const nextDisabled = current === totalPages ? 'disabled' : '';
    html += `<a href="#" class="page-link ${nextDisabled}" data-page="${current + 1}">&raquo;</a>`;

    pagination.innerHTML = html;

    // 添加点击事件
    if (onChange && typeof onChange === 'function') {
      pagination.addEventListener('click', (e) => {
        e.preventDefault();
        const link = e.target.closest('.page-link');
        if (
          link &&
          !link.classList.contains('disabled') &&
          !link.textContent.includes('...')
        ) {
          const page = parseInt(link.dataset.page);
          if (!isNaN(page)) {
            onChange(page);
          }
        }
      });
    }

    return pagination;
  }

  /**
   * 创建提示消息组件
   * @param {object} options 配置选项
   * @returns {HTMLElement} 提示消息元素
   */
  createMessage(options = {}) {
    const {
      text = '提示消息',
      type = 'info', // info, success, warning, error
      duration = 3000,
      showClose = true,
      id = this.generateId('message'),
    } = options;

    const message = document.createElement('div');
    message.id = id;
    message.className = `message message-${type}`;

    // 基础样式
    message.style.position = 'fixed';
    message.style.top = '20px';
    message.style.right = '20px';
    message.style.padding = '12px 20px';
    message.style.borderRadius = '8px';
    message.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    message.style.display = 'flex';
    message.style.alignItems = 'center';
    message.style.gap = '12px';
    message.style.zIndex = '9999';
    message.style.transition = 'opacity 0.3s, transform 0.3s';
    message.style.opacity = '0';
    message.style.transform = 'translateY(-20px)';

    // 设置颜色
    let backgroundColor, textColor, icon;
    switch (type) {
      case 'success':
        backgroundColor = '#F6FFED';
        textColor = '#52C41A';
        icon = 'check-circle';
        break;
      case 'warning':
        backgroundColor = '#FFF7E6';
        textColor = '#FAAD14';
        icon = 'exclamation-triangle';
        break;
      case 'error':
        backgroundColor = '#FFF1F0';
        textColor = '#F5222D';
        icon = 'times-circle';
        break;
      default:
        backgroundColor = '#E6F4FF';
        textColor = '#007AFF';
        icon = 'info-circle';
    }

    message.style.backgroundColor = backgroundColor;
    message.style.color = textColor;

    let html = `<i class="fas fa-${icon}"></i>`;
    html += `<span>${text}</span>`;

    if (showClose) {
      html += `<button type="button" class="message-close" style="background: none; border: none; margin-left: auto; cursor: pointer; color: inherit; font-size: 16px;">×</button>`;
    }

    message.innerHTML = html;

    // 添加到页面
    document.body.appendChild(message);

    // 显示动画
    setTimeout(() => {
      message.style.opacity = '1';
      message.style.transform = 'translateY(0)';
    }, 10);

    // 自动关闭
    if (duration > 0) {
      setTimeout(() => {
        this.closeMessage(id);
      }, duration);
    }

    // 关闭按钮事件
    if (showClose) {
      const closeBtn = message.querySelector('.message-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          this.closeMessage(id);
        });
      }
    }

    return message;
  }

  /**
   * 关闭提示消息
   * @param {string} messageId 消息ID
   */
  closeMessage(messageId) {
    const message = document.getElementById(messageId);
    if (message) {
      message.style.opacity = '0';
      message.style.transform = 'translateY(-20px)';
      setTimeout(() => {
        if (message.parentNode) {
          message.parentNode.removeChild(message);
        }
      }, 300);
    }
  }

  /**
   * 创建返回顶部按钮
   * @param {object} options 配置选项
   * @returns {HTMLElement} 返回顶部按钮元素
   */
  createBackToTop(options = {}) {
    const { id = 'backToTop' } = options;

    const button = document.createElement('button');
    button.id = id;
    button.className = 'back-to-top';
    button.innerHTML = '<i class="fas fa-arrow-up"></i>';
    button.style.display = 'none';

    // 添加滚动事件监听
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        button.classList.add('show');
      } else {
        button.classList.remove('show');
      }
    });

    // 添加点击事件
    button.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    });

    return button;
  }

  /**
   * 创建统计卡片组件
   * @param {object} options 配置选项
   * @returns {HTMLElement} 统计卡片元素
   */
  createStatCard(options = {}) {
    const {
      title = '统计标题',
      value = '0',
      icon = 'chart-bar',
      color = 'primary',
      trend = '', // up, down, ''
      trendValue = '',
      id = this.generateId('stat'),
    } = options;

    const card = document.createElement('div');
    card.id = id;
    card.className = 'stat-card card';
    card.style.display = 'flex';
    card.style.alignItems = 'center';
    card.style.gap = '20px';

    // 图标颜色
    let iconColor = '#007AFF';
    switch (color) {
      case 'success':
        iconColor = '#52C41A';
        break;
      case 'warning':
        iconColor = '#FAAD14';
        break;
      case 'danger':
        iconColor = '#F5222D';
        break;
    }

    // 趋势图标和颜色
    let trendHtml = '';
    if (trend) {
      const trendIcon = trend === 'up' ? 'arrow-up' : 'arrow-down';
      const trendColor = trend === 'up' ? '#52C41A' : '#F5222D';
      trendHtml = `<div class="stat-trend" style="color: ${trendColor}; font-size: 14px; margin-top: 4px;"> <i class="fas fa-${trendIcon}"></i> ${trendValue} </div>`;
    }

    card.innerHTML = `
            <div class="stat-icon" style="width: 56px; height: 56px; border-radius: 12px; background-color: ${iconColor}15; display: flex; align-items: center; justify-content: center; font-size: 24px; color: ${iconColor};">
                <i class="fas fa-${icon}"></i>
            </div>
            <div class="stat-content">
                <div class="stat-title" style="font-size: 14px; color: #666; margin-bottom: 4px;">${title}</div>
                <div class="stat-value" style="font-size: 28px; font-weight: 600; color: #1D2129;">${value}</div>
                ${trendHtml}
            </div>
        `;

    return card;
  }

  /**
   * 注册组件到连接管理器
   * @param {object} connectionManager 连接管理器实例
   */
  registerToConnectionManager(connectionManager) {
    if (
      !connectionManager ||
      typeof connectionManager.registerComponent !== 'function'
    ) {
      console.warn('连接管理器未提供或不支持组件注册');
      return;
    }

    // 注册所有组件
    connectionManager.registerComponent('button', this.createButton.bind(this));
    connectionManager.registerComponent('card', this.createCard.bind(this));
    connectionManager.registerComponent('modal', this.createModal.bind(this));
    connectionManager.registerComponent('form', this.createForm.bind(this));
    connectionManager.registerComponent(
      'formGroup',
      this.createFormGroup.bind(this)
    );
    connectionManager.registerComponent(
      'navigation',
      this.createNavigation.bind(this)
    );
    connectionManager.registerComponent('tag', this.createTag.bind(this));
    connectionManager.registerComponent('loader', this.createLoader.bind(this));
    connectionManager.registerComponent(
      'pagination',
      this.createPagination.bind(this)
    );
    connectionManager.registerComponent(
      'message',
      this.createMessage.bind(this)
    );
    connectionManager.registerComponent(
      'backToTop',
      this.createBackToTop.bind(this)
    );
    connectionManager.registerComponent(
      'statCard',
      this.createStatCard.bind(this)
    );

    // 注册功能
    connectionManager.registerFeature('components', {
      showModal: this.showModal.bind(this),
      hideModal: this.hideModal.bind(this),
      showMessage: this.createMessage.bind(this),
      closeMessage: this.closeMessage.bind(this),
    });

    console.log('组件库已成功注册到连接管理器');
  }
}

// 创建组件库实例
const componentLibrary = new ComponentLibrary();

// 自动注册到连接管理器（如果存在）
if (window.ConnectionManager) {
  componentLibrary.registerToConnectionManager(window.ConnectionManager);
} else {
  // 监听连接管理器加载
  window.addEventListener('connection.initialized', (event) => {
    if (window.ConnectionManager) {
      componentLibrary.registerToConnectionManager(window.ConnectionManager);
    }
  });
}

// 为了兼容不使用ES模块的环境
if (typeof window !== 'undefined') {
  window.ComponentLibrary = componentLibrary;
}
