// 权限管理配置
const PermissionConfig = {
    // 角色定义
    roles: {
        government: {
            name: '政府端用户',
            description: '政府相关部门用户，可查看和管理全局数据'
        },
        business: {
            name: '企业端用户',
            description: '房地产企业用户，可管理自身项目和数据'
        },
        association: {
            name: '协会端用户',
            description: '行业协会用户，可管理会员和行业数据'
        },
        school: {
            name: '院校端用户',
            description: '院校用户，可使用教学和实训功能'
        },
        public: {
            name: '大众端用户',
            description: '普通大众用户，可使用基础查询功能'
        },
        guest: {
            name: '游客',
            description: '未登录用户，可浏览基础内容'
        }
    },

    // 权限定义
    permissions: {
        // 页面访问权限
        access: {
            'ai-valuation': {
                name: 'AI估价',
                description: '访问AI估价功能'
            },
            'government': {
                name: '政府端',
                description: '访问政府端功能'
            },
            'business': {
                name: '企业端',
                description: '访问企业端功能'
            },
            'association': {
                name: '协会端',
                description: '访问协会端功能'
            },
            'school': {
                name: '院校端',
                description: '访问院校端功能'
            },
            'smart-nav': {
                name: '大众端',
                description: '访问大众端功能'
            },
            'platform': {
                name: '平台首页',
                description: '访问平台首页'
            },
            'reports': {
                name: '行业报告',
                description: '访问行业报告'
            },
            'cases': {
                name: '案例库',
                description: '访问案例库'
            },
            'api': {
                name: 'API服务',
                description: '访问API服务'
            },
            'template': {
                name: '模板社区',
                description: '访问模板社区'
            },
            'files': {
                name: '我的文件',
                description: '访问我的文件'
            },
            'solution': {
                name: '解决方案',
                description: '访问解决方案'
            },
            'enterprise': {
                name: '企业服务',
                description: '访问企业服务'
            },
            'pricing': {
                name: '价格',
                description: '访问价格页面'
            },
            'download': {
                name: '下载',
                description: '访问下载页面'
            },
            'main': {
                name: '工作台',
                description: '访问工作台'
            }
        },

        // 功能操作权限
        action: {
            'create-report': {
                name: '创建报告',
                description: '创建估价报告'
            },
            'edit-report': {
                name: '编辑报告',
                description: '编辑估价报告'
            },
            'delete-report': {
                name: '删除报告',
                description: '删除估价报告'
            },
            'view-report': {
                name: '查看报告',
                description: '查看估价报告'
            },
            'generate-report': {
                name: '生成报告',
                description: '生成AI估价报告'
            },
            'download-report': {
                name: '下载报告',
                description: '下载估价报告'
            },
            'manage-users': {
                name: '管理用户',
                description: '管理系统用户'
            },
            'manage-data': {
                name: '管理数据',
                description: '管理系统数据'
            },
            'view-statistics': {
                name: '查看统计',
                description: '查看统计数据'
            },
            'export-data': {
                name: '导出数据',
                description: '导出系统数据'
            }
        }
    },

    // 角色权限映射
    rolePermissions: {
        guest: {
            access: [
                'visual-index',
                'ai-valuation',
                'reports',
                'cases',
                'api',
                'template',
                'solution',
                'enterprise',
                'pricing',
                'download'
            ],
            action: [
                'view-report'
            ]
        },
        government: {
            access: [
                'visual-index',
                'government',
                'ai-valuation',
                'platform',
                'reports',
                'cases',
                'api',
                'template',
                'files',
                'solution',
                'enterprise',
                'pricing',
                'download',
                'main'
            ],
            action: [
                'create-report',
                'edit-report',
                'delete-report',
                'view-report',
                'generate-report',
                'download-report',
                'manage-users',
                'manage-data',
                'view-statistics',
                'export-data'
            ]
        },
        business: {
            access: [
                'visual-index',
                'business',
                'ai-valuation',
                'platform',
                'reports',
                'cases',
                'api',
                'template',
                'files',
                'solution',
                'enterprise',
                'pricing',
                'download',
                'main'
            ],
            action: [
                'create-report',
                'edit-report',
                'delete-report',
                'view-report',
                'generate-report',
                'download-report',
                'view-statistics'
            ]
        },
        association: {
            access: [
                'visual-index',
                'association',
                'ai-valuation',
                'platform',
                'reports',
                'cases',
                'api',
                'template',
                'files',
                'solution',
                'enterprise',
                'pricing',
                'download',
                'main'
            ],
            action: [
                'create-report',
                'edit-report',
                'view-report',
                'generate-report',
                'download-report',
                'manage-users',
                'view-statistics',
                'export-data'
            ]
        },
        school: {
            access: [
                'visual-index',
                'school',
                'ai-valuation',
                'platform',
                'reports',
                'cases',
                'api',
                'template',
                'files',
                'solution',
                'enterprise',
                'pricing',
                'download',
                'main'
            ],
            action: [
                'create-report',
                'edit-report',
                'view-report',
                'generate-report',
                'download-report',
                'view-statistics'
            ]
        },
        public: {
            access: [
                'visual-index',
                'smart-nav',
                'ai-valuation',
                'reports',
                'cases',
                'api',
                'template',
                'files',
                'solution',
                'enterprise',
                'pricing',
                'download',
                'main'
            ],
            action: [
                'create-report',
                'view-report',
                'generate-report',
                'download-report'
            ]
        }
    }
};

// 权限管理类
class PermissionManager {
    constructor() {
        this.currentUser = this.getUserFromStorage();
        this.init();
    }

    // 初始化
    init() {
        // 检查用户登录状态
        if (!this.currentUser) {
            // 默认游客身份
            this.currentUser = {
                id: 'guest',
                username: 'guest',
                role: 'guest',
                name: '游客'
            };
            this.saveUserToStorage(this.currentUser);
        }

        // 绑定事件
        this.bindEvents();

        // 应用权限控制
        this.applyPermissions();
    }

    // 从存储获取用户信息
    getUserFromStorage() {
        const userStr = localStorage.getItem('zhihuiyun_user');
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    }

    // 保存用户信息到存储
    saveUserToStorage(user) {
        localStorage.setItem('zhihuiyun_user', JSON.stringify(user));
    }

    // 绑定事件
    bindEvents() {
        // 登录按钮事件
        const loginBtns = document.querySelectorAll('.login-btn, .nav-login-btn');
        loginBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginModal();
            });
        });

        // 登出按钮事件
        const logoutBtns = document.querySelectorAll('.logout-btn');
        logoutBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        });
    }

    // 检查用户是否有页面访问权限
    hasAccess(page) {
        const permissions = PermissionConfig.rolePermissions[this.currentUser.role];
        return permissions && permissions.access.includes(page);
    }

    // 检查用户是否有操作权限
    hasAction(action) {
        const permissions = PermissionConfig.rolePermissions[this.currentUser.role];
        return permissions && permissions.action.includes(action);
    }

    // 应用权限控制
    applyPermissions() {
        // 处理导航菜单
        this.applyNavPermissions();

        // 处理页面内容
        this.applyContentPermissions();

        // 处理功能按钮
        this.applyButtonPermissions();

        // 处理页面访问控制
        this.applyPageAccessControl();
    }

    // 应用导航菜单权限
    applyNavPermissions() {
        const navLinks = document.querySelectorAll('.nav-item a, .sub-nav-item a');
        navLinks.forEach(link => {
            // 获取链接对应的页面
            const href = link.getAttribute('href');
            if (href && href !== 'javascript:void(0);') {
                const page = this.getPageFromHref(href);
                if (page && !this.hasAccess(page)) {
                    // 隐藏无权限的导航项
                    const navItem = link.closest('.nav-item, .sub-nav-item');
                    if (navItem) {
                        navItem.style.display = 'none';
                    }
                }
            }
        });
    }

    // 应用页面内容权限
    applyContentPermissions() {
        // 根据页面类型显示/隐藏内容
        const currentPage = this.getCurrentPage();
        const contentSections = document.querySelectorAll('[data-role]');
        
        contentSections.forEach(section => {
            const requiredRole = section.getAttribute('data-role');
            if (requiredRole) {
                if (this.currentUser.role !== requiredRole) {
                    // 游客模式下对核心内容添加水印或限制
                    if (this.currentUser.role === 'guest') {
                        // 显示有限内容并添加水印
                        section.style.opacity = '0.7';
                        // 添加水印效果
                        const watermark = document.createElement('div');
                        watermark.style.cssText = `
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            font-size: 36px;
                            color: rgba(0, 0, 0, 0.1);
                            pointer-events: none;
                            z-index: 10;
                            white-space: nowrap;
                            rotate: -30deg;
                        `;
                        watermark.textContent = '游客模式';
                        section.style.position = 'relative';
                        section.appendChild(watermark);
                    } else {
                        section.style.display = 'none';
                    }
                }
            }
        });

        // 显示角色专属内容
        const roleContent = document.querySelectorAll(`[data-role="${this.currentUser.role}"]`);
        roleContent.forEach(section => {
            section.style.display = 'block';
        });

        // 游客模式下隐藏核心功能入口
        if (this.currentUser.role === 'guest') {
            const coreFeatureLinks = document.querySelectorAll('a[href*="ai-valuation"], a[href*="generate-report"]');
            coreFeatureLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    // 显示登录模态框
                    this.showLoginModal();
                });
            });
        }
    }

    // 应用按钮权限
    applyButtonPermissions() {
        const buttons = document.querySelectorAll('[data-action]');
        buttons.forEach(button => {
            const action = button.getAttribute('data-action');
            if (action) {
                if (!this.hasAction(action)) {
                    // 核心功能按钮在游客模式下隐藏或禁用
                    if (this.currentUser.role === 'guest') {
                        // 对于需要权限的核心功能，添加水印或禁用
                        if (action === 'create-report' || action === 'generate-report' || action === 'download-report') {
                            button.style.opacity = '0.5';
                            button.style.cursor = 'not-allowed';
                            button.setAttribute('disabled', 'disabled');
                            button.innerHTML = '登录后使用';
                        } else {
                            button.style.display = 'none';
                        }
                    } else {
                        // 已登录用户直接隐藏无权限按钮
                        button.style.display = 'none';
                    }
                }
            }
        });
    }

    // 应用页面访问控制
    applyPageAccessControl() {
        const currentPage = this.getCurrentPage();
        if (currentPage && !this.hasAccess(currentPage)) {
            // 只有非游客用户才跳转到404，游客可以自由浏览所有页面
            if (this.currentUser.role !== 'guest') {
                // 跳转到无权限页面
                window.location.href = '404.html';
            }
        }
    }

    // 从URL获取页面名称
    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '');
        return page || 'index';
    }

    // 从链接获取页面名称
    getPageFromHref(href) {
        const url = new URL(href, window.location.origin);
        const page = url.pathname.split('/').pop().replace('.html', '');
        return page || 'index';
    }

    // 显示登录模态框
    showLoginModal() {
        // 检查是否已有登录模态框
        let modal = document.getElementById('login-modal');
        if (!modal) {
            modal = this.createLoginModal();
            document.body.appendChild(modal);
        }
        modal.style.display = 'block';
    }

    // 创建登录模态框
    createLoginModal() {
        const modal = document.createElement('div');
        modal.id = 'login-modal';
        modal.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        modal.innerHTML = `
            <div style="
                background-color: white;
                border-radius: 12px;
                padding: 40px;
                width: 90%;
                max-width: 500px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            ">
                <h2 style="margin-bottom: 30px; text-align: center; color: #333;">登录智汇云</h2>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #333;">用户名</label>
                    <input type="text" id="login-username" style="
                        width: 100%;
                        padding: 12px;
                        border: 1px solid #e0e0e0;
                        border-radius: 8px;
                        font-size: 14px;
                    ">
                </div>
                
                <div style="margin-bottom: 30px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #333;">密码</label>
                    <input type="password" id="login-password" style="
                        width: 100%;
                        padding: 12px;
                        border: 1px solid #e0e0e0;
                        border-radius: 8px;
                        font-size: 14px;
                    ">
                </div>
                
                <button id="login-submit" style="
                    width: 100%;
                    padding: 14px;
                    background-color: #667eea;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">登录</button>
                
                <div style="margin-top: 20px; text-align: center; color: #666; font-size: 14px;">
                    还没有账号？ <a href="#" style="color: #667eea; text-decoration: none;">立即注册</a>
                </div>
            </div>
        `;

        // 绑定登录事件
        const submitBtn = modal.querySelector('#login-submit');
        submitBtn.addEventListener('click', () => {
            this.handleLogin();
        });

        // 关闭模态框
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        return modal;
    }

    // 处理登录
    handleLogin() {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        // 简单的模拟登录（实际项目中应调用后端API）
        if (username && password) {
            // 登录成功后显示角色选择
            this.showRoleSelection();
            
            // 关闭登录模态框
            const loginModal = document.getElementById('login-modal');
            if (loginModal) {
                loginModal.style.display = 'none';
            }
        } else {
            alert('请输入用户名和密码');
        }
    }

    // 显示角色选择
    showRoleSelection() {
        // 检查是否已有角色选择模态框
        let modal = document.getElementById('role-selection-modal');
        if (!modal) {
            modal = this.createRoleSelectionModal();
            document.body.appendChild(modal);
        }
        modal.style.display = 'block';
    }

    // 创建角色选择模态框
    createRoleSelectionModal() {
        const modal = document.createElement('div');
        modal.id = 'role-selection-modal';
        modal.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        // 生成角色选择内容
        const rolesHtml = Object.entries(PermissionConfig.roles)
            .filter(([key]) => key !== 'guest')
            .map(([key, role]) => `
                <div style="
                    padding: 20px;
                    margin-bottom: 15px;
                    border: 2px solid #e0e0e0;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                " data-role="${key}">
                    <h3 style="margin-bottom: 10px; color: #333;">${role.name}</h3>
                    <p style="color: #666; font-size: 14px; margin: 0;">${role.description}</p>
                </div>
            `)
            .join('');

        modal.innerHTML = `
            <div style="
                background-color: white;
                border-radius: 12px;
                padding: 40px;
                width: 90%;
                max-width: 600px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            ">
                <h2 style="margin-bottom: 30px; text-align: center; color: #333;">选择您的身份</h2>
                
                <div id="role-list" style="margin-bottom: 20px;">
                    ${rolesHtml}
                </div>
                
                <div style="text-align: center; font-size: 14px; color: #666;">
                    请选择您的身份，以便我们为您提供个性化服务
                </div>
            </div>
        `;

        // 绑定角色选择事件
        const roleItems = modal.querySelectorAll('[data-role]');
        roleItems.forEach(item => {
            item.addEventListener('click', () => {
                const role = item.getAttribute('data-role');
                this.selectRole(role);
            });
        });

        return modal;
    }

    // 选择角色
    selectRole(role) {
        // 更新用户角色
        this.currentUser.role = role;
        this.currentUser.name = PermissionConfig.roles[role].name;
        this.saveUserToStorage(this.currentUser);

        // 关闭角色选择模态框
        const modal = document.getElementById('role-selection-modal');
        if (modal) {
            modal.style.display = 'none';
        }

        // 重新应用权限
        this.applyPermissions();

        // 刷新页面以显示角色专属内容
        window.location.reload();
    }

    // 登出
    logout() {
        // 清除用户信息
        localStorage.removeItem('zhihuiyun_user');
        
        // 重置为游客身份
        this.currentUser = {
            id: 'guest',
            username: 'guest',
            role: 'guest',
            name: '游客'
        };
        
        // 刷新页面
        window.location.reload();
    }

    // 获取当前用户信息
    getCurrentUser() {
        return this.currentUser;
    }

    // 获取当前页面名称
    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '');
        return page || 'visual-index';
    }

    // 从链接获取页面名称
    getPageFromHref(href) {
        const url = new URL(href, window.location.origin);
        const page = url.pathname.split('/').pop().replace('.html', '');
        return page || 'visual-index';
    }
}

// 初始化权限管理
let permissionManager;

document.addEventListener('DOMContentLoaded', () => {
    permissionManager = new PermissionManager();
});

// 导出权限管理实例
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PermissionManager;
}