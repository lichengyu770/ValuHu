/**
 * 共享JavaScript文件 - 数智估价核心引擎
 * 处理多页面通用功能
 */

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function () {
  // 初始化所有通用功能
  initNavbar();
  initMobileMenu();
  initBackToTop();
  initSmoothScroll();
  initFadeInAnimation();
  initLoginModal();
  initSearchFunctionality();

  // 页面特定的初始化函数（由各页面自行定义）
  if (typeof pageInit === 'function') {
    pageInit();
  }
});

// 初始化导航栏高亮
function initNavbar() {
  // 安全检查元素是否存在
  const navLinks = document.querySelectorAll('.nav-menu a, .mobile-menu a');
  if (!navLinks.length) return;

  const currentPath = window.location.pathname;

  navLinks.forEach((link) => {
    try {
      const linkPath = link.getAttribute('href');
      if (!linkPath) return;

      // 移除所有active类，避免重复添加
      link.classList.remove('active');

      // 首页特殊处理
      if (
        linkPath === '#home' &&
        (currentPath === '/' || currentPath.endsWith('/index.html'))
      ) {
        link.classList.add('active');
      }
      // 其他页面处理
      else if (linkPath.startsWith('#')) {
        // 页面内锚点，不处理
      } else if (currentPath.endsWith(linkPath)) {
        link.classList.add('active');
      }
    } catch (error) {
      console.error('导航栏链接处理错误:', error);
    }
  });
}

// 初始化移动端菜单
function initMobileMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  if (!menuToggle || !mobileMenu) return;

  // 初始化菜单状态
  mobileMenu.classList.remove('active');

  // 菜单切换功能
  menuToggle.addEventListener('click', function () {
    try {
      // 使用class切换替代直接设置style.display
      mobileMenu.classList.toggle('active');

      // 切换图标类
      const icon = menuToggle.querySelector('i');
      if (icon) {
        if (icon.classList.contains('fa-bars')) {
          icon.classList.remove('fa-bars');
          icon.classList.add('fa-times');
        } else {
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
      }

      // 防止滚动
      document.body.classList.toggle('no-scroll');
    } catch (error) {
      console.error('移动端菜单切换错误:', error);
    }
  });

  // 点击移动端菜单项后关闭菜单
  const mobileLinks = mobileMenu.querySelectorAll('a');
  mobileLinks.forEach((link) => {
    link.addEventListener('click', function () {
      try {
        mobileMenu.classList.remove('active');
        document.body.classList.remove('no-scroll');

        // 重置图标
        const icon = menuToggle.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
      } catch (error) {
        console.error('移动端菜单项点击错误:', error);
      }
    });
  });

  // 点击外部关闭移动端菜单
  document.addEventListener('click', function (e) {
    if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
      mobileMenu.classList.remove('active');
      document.body.classList.remove('no-scroll');

      // 重置图标
      const icon = menuToggle.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    }
  });
}

// 初始化返回顶部按钮
function initBackToTop() {
  // 检查是否已存在返回顶部按钮，避免重复创建
  if (document.querySelector('.back-to-top')) return;

  const backToTopBtn = document.createElement('div');
  backToTopBtn.className = 'back-to-top';
  backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
  document.body.appendChild(backToTopBtn);

  // 平滑滚动到顶部
  backToTopBtn.addEventListener('click', function () {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });

  // 滚动显示/隐藏按钮
  window.addEventListener('scroll', function () {
    if (window.pageYOffset > 300) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });
}

// 初始化平滑滚动
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();

      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        // 计算偏移量，考虑导航栏高度
        let navbarHeight = 0;
        const navbar = document.querySelector('.navbar');
        if (navbar) {
          navbarHeight = navbar.offsetHeight;
        }

        const targetPosition =
          targetElement.getBoundingClientRect().top +
          window.pageYOffset -
          navbarHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        });
      }
    });
  });
}

// 初始化淡入动画
function initFadeInAnimation() {
  const fadeElements = document.querySelectorAll('.fade-in');

  if (!fadeElements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px', // 添加底部偏移，提高动画触发体验
    }
  );

  fadeElements.forEach((element) => {
    // 确保元素初始状态正确
    element.classList.remove('active');
    observer.observe(element);
  });
}

// 初始化登录模态框
function initLoginModal() {
  const loginBtn = document.getElementById('loginBtn');
  const mobileLoginBtn = document.getElementById('mobileLoginBtn');

  if (loginBtn) {
    loginBtn.addEventListener('click', function () {
      // 如果是在首页，显示登录模态框
      if (
        window.location.pathname.endsWith('/index.html') ||
        window.location.pathname === '/'
      ) {
        const modal = document.getElementById('loginModal');
        if (modal) {
          modal.style.display = 'flex';
        }
      } else {
        // 否则跳转到登录页面
        window.location.href = '/auth-demo.html';
      }
    });
  }

  if (mobileLoginBtn) {
    mobileLoginBtn.addEventListener('click', function () {
      window.location.href = '/auth-demo.html';
    });
  }
}

// 初始化搜索功能
function initSearchFunctionality() {
  // 查找搜索框元素
  const searchInputs = document.querySelectorAll('.search-input');
  const searchBtns = document.querySelectorAll('.search-btn');

  if (!searchInputs.length && !searchBtns.length) return;

  // 搜索处理函数
  function handleSearch() {
    // 获取搜索输入
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) return;

    const searchTerm = searchInput.value.trim();
    if (!searchTerm) {
      showMessage('请输入搜索关键词', 'warning');
      return;
    }

    // 在实际项目中，这里会跳转到搜索结果页面
    // 目前我们使用模拟实现
    showMessage(`正在搜索: ${searchTerm}`, 'info');
    console.log('搜索关键词:', searchTerm);

    // 清空搜索输入
    searchInput.value = '';

    // 模拟搜索结果显示
    setTimeout(() => {
      showMessage(`搜索完成，共找到 0 条结果`, 'success');
    }, 1000);
  }

  // 为搜索按钮添加点击事件
  searchBtns.forEach((btn) => {
    btn.addEventListener('click', handleSearch);
  });

  // 为搜索输入添加回车事件
  searchInputs.forEach((input) => {
    input.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        handleSearch();
      }
    });
  });
}

// 关闭模态框函数（供其他地方调用）
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
  }
}

// 显示提示消息函数
function showMessage(message, type = 'info') {
  // 安全检查
  if (!message) return;

  // 创建消息元素
  const messageElement = document.createElement('div');
  messageElement.className = `message-toast ${type}`;
  messageElement.textContent = message;
  messageElement.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: #333;
        color: white;
        padding: 12px 24px;
        border-radius: 6px;
        z-index: 3000;
        opacity: 0;
        transition: opacity 0.3s, transform 0.3s;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-size: 14px;
        font-weight: 500;
        max-width: 90%;
        word-wrap: break-word;
        text-align: center;
    `;

  // 根据类型设置不同背景色
  if (type === 'success') messageElement.style.background = '#52c41a';
  if (type === 'error') messageElement.style.background = '#f5222d';
  if (type === 'warning') messageElement.style.background = '#faad14';

  // 添加到页面
  document.body.appendChild(messageElement);

  // 显示消息
  setTimeout(() => {
    messageElement.style.opacity = '1';
    messageElement.style.transform = 'translateX(-50%) translateY(0)';
  }, 10);

  // 3秒后移除
  setTimeout(() => {
    messageElement.style.opacity = '0';
    messageElement.style.transform = 'translateX(-50%) translateY(-10px)';
    setTimeout(() => {
      // 确保元素存在再移除
      if (document.body.contains(messageElement)) {
        document.body.removeChild(messageElement);
      }
    }, 300);
  }, 3000);
}

// 检查用户登录状态
function checkLoginStatus() {
  const token = localStorage.getItem('auth_token');
  return !!token;
}

// 获取当前登录用户信息
function getCurrentUser() {
  const userInfo = localStorage.getItem('user_info');
  try {
    return userInfo ? JSON.parse(userInfo) : null;
  } catch (e) {
    console.error('解析用户信息失败:', e);
    return null;
  }
}

// 初始化搜索功能
function initSearch() {
  const searchBox = document.querySelector('.search-box');
  const searchInput = document.querySelector('.search-input');
  const searchBtn = document.querySelector('.search-btn');

  if (!searchBox || !searchInput || !searchBtn) return;

  // 搜索功能实现
  function handleSearch() {
    const searchTerm = searchInput.value.trim();
    if (!searchTerm) return;

    // 这里可以根据实际需求扩展搜索逻辑
    // 目前简单实现：在控制台输出搜索词并显示提示
    console.log('搜索内容:', searchTerm);
    showMessage(`已搜索: "${searchTerm}"`, 'info');

    // 可以根据需要跳转到搜索结果页面
    // window.location.href = `/search.html?q=${encodeURIComponent(searchTerm)}`;

    // 清空搜索框
    searchInput.value = '';
  }

  // 点击搜索按钮执行搜索
  searchBtn.addEventListener('click', handleSearch);

  // 回车键执行搜索
  searchInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      handleSearch();
    }
  });

  console.log('搜索功能初始化完成');
}

// 表单提交服务类
class FormSubmissionService {
  constructor() {
    this.archivedData = JSON.parse(
      localStorage.getItem('formSubmissionArchive') || '[]'
    );
  }

  // 生成唯一ID
  generateId(prefix = 'submission') {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  // 验证邮箱格式
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // 验证必填字段
  validateRequired(value) {
    return (
      value !== undefined && value !== null && value.toString().trim() !== ''
    );
  }

  // 防止XSS攻击，清理HTML标签
  sanitizeHTML(input) {
    if (typeof input !== 'string') return input;

    // 创建一个临时元素来过滤HTML标签
    const tempElement = document.createElement('div');
    tempElement.textContent = input;
    return tempElement.innerHTML;
  }

  // 验证文件大小和类型
  validateFiles(files) {
    if (!files || files.length === 0) return { valid: true, message: '' };

    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'text/plain',
    ];

    for (const file of files) {
      // 检查文件大小
      if (file.size > maxFileSize) {
        return { valid: false, message: `文件 ${file.name} 超过10MB大小限制` };
      }

      // 检查文件类型
      if (!allowedTypes.includes(file.type)) {
        return { valid: false, message: `文件 ${file.name} 类型不支持` };
      }
    }

    return { valid: true, message: '' };
  }

  // 规范化表单数据，添加XSS防护
  normalizeFormData(formData) {
    const normalizedData = {};

    for (const field in formData) {
      if (formData.hasOwnProperty(field)) {
        let value = formData[field];

        // 对字符串字段进行XSS清理
        if (typeof value === 'string') {
          value = this.sanitizeHTML(value.trim());
        }

        normalizedData[field] = value;
      }
    }

    const now = new Date();
    return {
      ...normalizedData,
      submissionId: this.generateId('submission'),
      submissionDate: now.toISOString(),
      formattedDate: now.toLocaleString('zh-CN'),
      status: 'pending',
      emailSent: false,
    };
  }

  // 生成标准样本格式
  generateStandardSample(normalizedData) {
    let sampleTemplate =
      `--- 客户表单提交样本 ---
` +
      `提交ID: ${normalizedData.submissionId}\n` +
      `提交时间: ${normalizedData.formattedDate}\n` +
      `--- 基本信息 ---\n` +
      `姓名: ${normalizedData.name || '未填写'}\n` +
      `邮箱: ${normalizedData.email || '未填写'}\n` +
      `电话: ${normalizedData.phone || '未填写'}\n` +
      `主题: ${normalizedData.subject || '未填写'}\n` +
      `--- 留言内容 ---\n` +
      `${normalizedData.message || '未填写'}\n`;

    // 添加附件信息
    if (normalizedData.attachments && normalizedData.attachments.length > 0) {
      sampleTemplate += `--- 附件信息 ---\n`;
      normalizedData.attachments.forEach((attachment, index) => {
        sampleTemplate += `${index + 1}. ${attachment.name} (${attachment.type}, ${attachment.sizeFormatted})\n`;
      });
    }

    sampleTemplate +=
      `--- 附加信息 ---\n` +
      `状态: ${normalizedData.status}\n` +
      `邮件发送状态: ${normalizedData.emailSent ? '已发送' : '未发送'}\n` +
      `--- 样本结束 ---`;

    return sampleTemplate;
  }

  // 归档表单数据
  archiveFormData(normalizedData) {
    // 生成标准样本
    const standardSample = this.generateStandardSample(normalizedData);

    // 添加样本到数据中
    const archivedItem = {
      ...normalizedData,
      standardSample,
    };

    // 保存到归档列表
    this.archivedData.unshift(archivedItem);
    localStorage.setItem(
      'formSubmissionArchive',
      JSON.stringify(this.archivedData)
    );

    return archivedItem;
  }

  // 发送邮件
  async sendEmail(archivedItem, recipient) {
    try {
      // 实际项目中，这里会调用真实的邮件发送API
      // 目前使用模拟实现
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 构建邮件内容
      const emailContent = {
        to: recipient,
        subject: `客户表单提交 - ${archivedItem.submissionId}`,
        body: `尊敬的收件人：\n\n您收到了一份新的客户表单提交，详情如下：\n\n${archivedItem.standardSample}\n\n请及时处理。\n\n此致，\n表单系统`,
      };

      // 记录日志
      console.log('[邮件发送] 邮件已发送:', {
        recipient: emailContent.to,
        subject: emailContent.subject,
        content: emailContent.body,
      });

      // 更新归档数据状态
      archivedItem.emailSent = true;
      archivedItem.status = 'completed';
      localStorage.setItem(
        'formSubmissionArchive',
        JSON.stringify(this.archivedData)
      );

      return true;
    } catch (error) {
      console.error('发送邮件失败:', error);
      // 更新归档数据状态
      archivedItem.status = 'failed';
      localStorage.setItem(
        'formSubmissionArchive',
        JSON.stringify(this.archivedData)
      );
      throw new Error('邮件发送失败');
    }
  }

  // 完整的表单提交流程
  async submitForm(formData, recipient) {
    try {
      // 1. 验证表单数据
      if (!this.validateRequired(formData.name)) {
        throw new Error('请输入姓名');
      }
      if (!this.validateRequired(formData.email)) {
        throw new Error('请输入邮箱');
      }
      if (!this.validateEmail(formData.email)) {
        throw new Error('请输入有效的邮箱地址');
      }
      if (!this.validateRequired(formData.subject)) {
        throw new Error('请选择主题');
      }
      if (!this.validateRequired(formData.message)) {
        throw new Error('请输入留言内容');
      }

      // 2. 规范化表单数据
      const normalizedData = this.normalizeFormData(formData);

      // 3. 归档表单数据
      const archivedItem = this.archiveFormData(normalizedData);

      // 4. 发送邮件
      await this.sendEmail(archivedItem, recipient);

      return {
        success: true,
        message: '表单提交成功，邮件已发送',
        data: archivedItem,
      };
    } catch (error) {
      console.error('表单提交流程失败:', error);
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }
}

// 创建全局表单提交服务实例
window.formSubmissionService = new FormSubmissionService();

// 简化的表单提交处理函数，可在各页面直接使用
async function handleFormSubmit(
  formId,
  recipientEmail = 'lichengyu@fangsuanyun.cn'
) {
  const form = document.getElementById(formId);
  if (!form) {
    console.error('表单不存在:', formId);
    return { success: false, message: '表单不存在' };
  }

  // 获取表单数据
  const formData = new FormData(form);
  const data = {
    name: formData.get('name') || formData.get('username'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    subject: formData.get('subject'),
    message: formData.get('message') || formData.get('content'),
  };

  // 处理文件上传
  const files = form.querySelector('input[type="file"]');
  let uploadedFiles = [];
  if (files && files.files.length > 0) {
    // 验证文件
    const validationResult = window.formSubmissionService.validateFiles(
      files.files
    );
    if (!validationResult.valid) {
      showMessage(validationResult.message, 'error');
      return { success: false, message: validationResult.message };
    }

    // 处理文件信息（不实际上传文件，仅记录信息）
    uploadedFiles = Array.from(files.files).map((file) => ({
      name: file.name,
      type: file.type,
      size: file.size,
      sizeFormatted: formatFileSize(file.size),
    }));

    data.attachments = uploadedFiles;
  }

  try {
    // 使用表单提交服务处理表单
    const result = await window.formSubmissionService.submitForm(
      data,
      recipientEmail
    );

    // 显示结果
    showMessage(result.message, result.success ? 'success' : 'error');

    if (result.success) {
      // 表单重置
      form.reset();
    }

    return result;
  } catch (error) {
    console.error('表单提交错误:', error);
    showMessage('表单提交失败: ' + error.message, 'error');
    return { success: false, message: error.message };
  }
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
