// 导航栏组件
class NavigationBar {
    constructor() {
        this.init();
    }

    init() {
        this.createNav();
        this.bindEvents();
    }

    createNav() {
        // 检查是否已有导航栏
        if (document.getElementById('nav-container')) {
            return;
        }

        // 创建导航栏容器
        const navContainer = document.createElement('div');
        navContainer.id = 'nav-container';
        navContainer.innerHTML = `
            <nav class="nav-menu">
                <div class="nav-item">
                    <a href="visual-index.html">AI估价</a>
                    <span class="nav-badge hot">Hot</span>
                </div>
                <div class="nav-item">
                    <a href="platform.html">智汇云平台</a>
                </div>
                <div class="nav-item">
                    <a href="government.html" data-role="government">政府端</a>
                </div>
                <div class="nav-item">
                    <a href="business.html" data-role="business">企业端</a>
                </div>
                <div class="nav-item">
                    <a href="association.html" data-role="association">协会端</a>
                </div>
                <div class="nav-item">
                    <a href="school.html" data-role="school">院校端</a>
                </div>
                <div class="nav-item">
                    <a href="smart-nav.html" data-role="public">大众端</a>
                </div>
                <div class="nav-item">
                    <a href="reports.html">行业报告</a>
                </div>
                <div class="nav-item">
                    <a href="cases.html">案例库</a>
                </div>
                <div class="nav-item">
                    <a href="api.html">API服务</a>
                </div>
                <div class="nav-item">
                    <a href="tutorials.html">使用教程</a>
                </div>
                <a href="login.html" class="login-btn">登录/注册</a>
                <a href="javascript:void(0);" class="logout-btn" style="display: none;">退出登录</a>
            </nav>
        `;

        // 添加到页面
        const header = document.querySelector('.header');
        if (header) {
            const headerContent = header.querySelector('.header-content');
            if (headerContent) {
                headerContent.appendChild(navContainer);
            }
        }
    }

    bindEvents() {
        // 导航链接点击事件
        const navLinks = document.querySelectorAll('.nav-item a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const role = link.getAttribute('data-role');
                if (role) {
                    // 检查用户是否有相应角色权限
                    const currentUser = permissionManager.getCurrentUser();
                    if (currentUser.role !== role) {
                        e.preventDefault();
                        // 显示权限提示
                        alert('您没有权限访问该页面，请先登录并选择相应角色');
                        // 显示登录模态框
                        permissionManager.showLoginModal();
                    }
                }
            });
        });
    }

    // 更新导航栏状态
    updateNav() {
        const currentUser = permissionManager.getCurrentUser();
        const navLinks = document.querySelectorAll('.nav-item a');
        const loginBtn = document.querySelector('.login-btn');
        const logoutBtn = document.querySelector('.logout-btn');

        // 更新登录/登出按钮
        if (currentUser.role === 'guest') {
            loginBtn.style.display = 'block';
            logoutBtn.style.display = 'none';
        } else {
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'block';
        }

        // 更新导航链接显示
        navLinks.forEach(link => {
            const role = link.getAttribute('data-role');
            const href = link.getAttribute('href');
            const page = permissionManager.getPageFromHref(href);

            if (role || page) {
                if (permissionManager.hasAccess(page)) {
                    link.style.display = 'block';
                } else {
                    link.style.display = 'none';
                }
            }
        });
    }
}

// 初始化导航栏
let navBar;

document.addEventListener('DOMContentLoaded', () => {
    navBar = new NavigationBar();
});

// 导出导航栏实例
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationBar;
}