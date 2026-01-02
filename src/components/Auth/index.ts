// 登录认证相关组件整合入口

// 定义LoginComponents接口
interface LoginComponents {
  init: () => void;
  showLoginModal: () => void;
  hideLoginModal: () => void;
}

// 模拟LoginComponents实现
class LoginComponentsImpl implements LoginComponents {
  init(): void {
    // 初始化登录组件
    const loginForm = document.getElementById('login-form') as HTMLFormElement;
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // 这里应该实现实际的登录逻辑

      });
    }
  }

  showLoginModal(): void {
    const loginModal = document.getElementById('login-modal');
    if (loginModal) {
      loginModal.classList.remove('hidden');
    }
  }

  hideLoginModal(): void {
    const loginModal = document.getElementById('login-modal');
    if (loginModal) {
      loginModal.classList.add('hidden');
    }
  }
}

// 单例实例
let loginComponentsInstance: LoginComponentsImpl | null = null;

/**
 * 获取登录组件实例
 * @returns {LoginComponents} 登录组件实例
 */
export function getLoginComponentsInstance(): LoginComponents {
  if (!loginComponentsInstance) {
    loginComponentsInstance = new LoginComponentsImpl();
  }
  return loginComponentsInstance;
}

/**
 * 初始化认证组件
 * @returns {LoginComponents} 登录组件实例
 */
export function initializeAuthComponents(): LoginComponents {
  // 确保DOM中已经有相关元素
  ensureAuthElementsInDOM();

  // 获取并初始化登录组件实例
  const loginComponents = getLoginComponentsInstance();
  loginComponents.init();

  return loginComponents;
}

/**
 * 确保认证相关的DOM元素存在
 */
function ensureAuthElementsInDOM(): void {
  // 检查并添加登录模态框
  if (!document.getElementById('login-modal')) {
    const loginModalHTML = `
      <div id="login-modal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 hidden">
        <div class="bg-white rounded-lg w-full max-w-md">
          <div class="p-6 border-b">
            <h3 class="text-lg font-semibold">系统登录</h3>
          </div>
          <div class="p-6">
            <form id="login-form" class="space-y-4">
              <div>
                <label class="block text-sm mb-1">用户名</label>
                <input type="text" id="username" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="请输入用户名">
              </div>
              <div>
                <label class="block text-sm mb-1">密码</label>
                <input type="password" id="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="请输入密码">
              </div>
              <div>
                <label class="block text-sm mb-1">角色</label>
                <select id="user-role" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="admin">系统管理员</option>
                  <option value="reviewer">审核员</option>
                  <option value="user">普通用户</option>
                </select>
              </div>
              <button type="submit" class="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 btn-hover">
                登录
              </button>
            </form>
          </div>
        </div>
      </div>
    `;

    // 添加到body末尾
    document.body.insertAdjacentHTML('beforeend', loginModalHTML.trim());
  }

  // 注意：用户菜单容器应该由应用的导航栏来提供
  // 这里不自动添加，避免与现有结构冲突
}

/**
 * 创建用户菜单容器HTML
 * @returns {string} 用户菜单HTML字符串
 */
export function getUserMenuHTML(): string {
  return `
    <div class="relative" id="user-menu-container">
      <button id="user-menu-btn" class="flex items-center gap-2 text-white/80 hover:text-white btn-hover">
        <img src="https://picsum.photos/id/1005/40/40" alt="用户头像" class="w-8 h-8 rounded-full object-cover border border-gray-200">
        <div class="text-right hidden md:block">
          <p class="text-sm font-medium text-white" id="current-username">未登录</p>
          <p class="text-xs text-white/80" id="current-role">请先登录</p>
        </div>
      </button>
      
      <!-- 用户下拉菜单 -->
      <div id="user-dropdown" class="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 hidden z-40">
        <div class="p-3 border-b">
          <p class="text-sm font-medium" id="dropdown-username">未登录</p>
          <p class="text-xs" id="dropdown-role">请先登录</p>
        </div>
        <div class="p-2">
          <a href="#profile" class="flex items-center px-3 py-2 text-sm hover:bg-gray-50 rounded-md">
            <i class="fa fa-user-o w-4 mr-2"></i>个人资料
          </a>
          <a href="#settings" class="flex items-center px-3 py-2 text-sm hover:bg-gray-50 rounded-md">
            <i class="fa fa-cog w-4 mr-2"></i>账户设置
          </a>
          <button id="logout-btn" class="w-full flex items-center px-3 py-2 text-sm text-warning hover:bg-gray-50 rounded-md">
            <i class="fa fa-sign-out w-4 mr-2"></i>退出登录
          </button>
        </div>
      </div>
    </div>
  `.trim();
}

/**
 * 显示登录模态框
 */
export function showLoginModal(): void {
  const loginComponents = getLoginComponentsInstance();
  loginComponents.showLoginModal();
}

/**
 * 隐藏登录模态框
 */
export function hideLoginModal(): void {
  const loginComponents = getLoginComponentsInstance();
  loginComponents.hideLoginModal();
}

// 导出主要组件类和实例
export { LoginComponentsImpl as LoginComponents };

// 导出认证服务相关功能
export * from '../../services/auth/AuthService';

// 默认导出
export default {
  initializeAuthComponents,
  getUserMenuHTML,
  showLoginModal,
  hideLoginModal,
  LoginComponents: LoginComponentsImpl,
  getLoginComponentsInstance,
};
