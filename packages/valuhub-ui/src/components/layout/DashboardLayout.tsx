import React, { useState } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  user?: {
    name: string;
    avatar?: string;
    role: string;
  };
  navigation: Array<{
    id: string;
    title: string;
    icon: string;
    href: string;
    active?: boolean;
    children?: Array<{
      id: string;
      title: string;
      href: string;
      active?: boolean;
    }>;
  }>;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
  onNavItemClick?: (item: any) => void;
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  subtitle,
  user,
  navigation,
  sidebarCollapsed = false,
  onSidebarToggle,
  onNavItemClick,
  headerActions,
  footer,
  className = '',
}) => {
  const [collapsed, setCollapsed] = useState(sidebarCollapsed);

  // 切换侧边栏折叠状态
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    onSidebarToggle?.();
  };

  // 处理导航项点击
  const handleNavItemClick = (item: any) => {
    onNavItemClick?.(item);
  };

  return (
    <div className={`flex h-screen bg-gray-50 overflow-hidden ${className}`}>
      {/* 侧边栏 */}
      <aside
        className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${collapsed ? 'w-16' : 'w-64'}`}
      >
        {/* 品牌标识 */}
        <div className={`flex items-center justify-center p-4 ${collapsed ? 'h-16' : 'h-20'}`}>
          <div className="flex items-center gap-2">
            <img
              src="图片1.png"
              alt="ValuHub Logo"
              className="w-8 h-8 object-contain"
            />
            {!collapsed && <span className="text-xl font-bold text-primary">ValuHub</span>}
          </div>
        </div>

        {/* 侧边栏导航 */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {navigation.map(item => (
              <li key={item.id} className="group">
                <button
                  className={`flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${item.active
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-primary'}`}
                  onClick={() => handleNavItemClick(item)}
                >
                  <span className="text-lg">{item.icon}</span>
                  {!collapsed && <span>{item.title}</span>}
                </button>

                {/* 子菜单 */}
                {item.children && item.children.length > 0 && !collapsed && item.active && (
                  <ul className="pl-10 space-y-1 mt-1">
                    {item.children.map(child => (
                      <li key={child.id}>
                        <button
                          className={`flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${child.active
                            ? 'bg-primary/10 text-primary'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-primary'}`}
                          onClick={() => handleNavItemClick(child)}
                        >
                          {child.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* 侧边栏底部 */}
        {!collapsed && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                <div className="text-xs text-gray-500">{user?.role}</div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部导航栏 */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4">
          {/* 左侧：菜单切换 + 页面标题 */}
          <div className="flex items-center gap-4">
            <button
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-primary transition-colors"
              onClick={toggleSidebar}
            >
              <span className="text-lg">{collapsed ? '☰' : '✕'}</span>
            </button>
            <div>
              {title && <h1 className="text-lg font-semibold text-gray-900">{title}</h1>}
              {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
            </div>
          </div>

          {/* 右侧：操作按钮 */}
          <div className="flex items-center gap-3">
            {/* 通知按钮 */}
            <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-primary transition-colors relative">
              <span className="text-lg">🔔</span>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white text-xs rounded-full flex items-center justify-center">3</span>
            </button>

            {/* 自定义操作 */}
            {headerActions}

            {/* 用户菜单 */}
            {user && (
              <div className="relative">
                <button className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-900">{user.name}</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* 内容区域 */}
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>

        {/* 页脚 */}
        {footer && (
          <footer className="bg-white border-t border-gray-200 p-4 text-center text-sm text-gray-500">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};

export default DashboardLayout;