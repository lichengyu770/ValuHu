import React, { useState } from 'react';

interface PublicLayoutProps {
  children: React.ReactNode;
  title?: string;
  navigation: Array<{
    id: string;
    title: string;
    href: string;
    active?: boolean;
    children?: Array<{
      id: string;
      title: string;
      href: string;
      active?: boolean;
    }>;
  }>;
  hero?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  onNavItemClick?: (item: any) => void;
  mobileMenuOpen?: boolean;
  onMobileMenuToggle?: () => void;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({
  children,
  title,
  navigation,
  hero,
  footer,
  className = '',
  onNavItemClick,
  mobileMenuOpen = false,
  onMobileMenuToggle,
}) => {
  const [mobileMenu, setMobileMenu] = useState(mobileMenuOpen);

  // 切换移动端菜单
  const toggleMobileMenu = () => {
    setMobileMenu(!mobileMenu);
    onMobileMenuToggle?.();
  };

  // 处理导航项点击
  const handleNavItemClick = (item: any) => {
    setMobileMenu(false);
    onNavItemClick?.(item);
  };

  return (
    <div className={`min-h-screen bg-white ${className}`}>
      {/* 顶部导航栏 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* 品牌标识 */}
            <a href="/" className="flex items-center gap-2">
              <img
                src="图片1.png"
                alt="ValuHub Logo"
                className="w-10 h-10 object-contain"
              />
              <span className="text-2xl font-bold text-primary">ValuHub</span>
            </a>

            {/* 桌面端导航 */}
            <nav className="hidden md:flex items-center gap-8">
              <ul className="flex items-center gap-8">
                {navigation.map(item => (
                  <li key={item.id} className="relative group">
                    <a
                      href={item.href}
                      className={`inline-flex items-center gap-1 text-base font-medium transition-colors duration-200 ${item.active
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-gray-700 hover:text-primary'}`}
                      onClick={() => handleNavItemClick(item)}
                    >
                      {item.title}
                      {item.children && (
                        <span className="text-sm">▼</span>
                      )}
                    </a>
                    {/* 下拉菜单 */}
                    {item.children && item.children.length > 0 && (
                      <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-2">
                        {item.children.map(child => (
                          <a
                            key={child.id}
                            href={child.href}
                            className={`block px-4 py-2 text-sm ${child.active
                              ? 'bg-primary/10 text-primary'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-primary'}`}
                            onClick={() => handleNavItemClick(child)}
                          >
                            {child.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>

              {/* 登录/注册按钮 */}
              <div className="flex items-center gap-3">
                <a
                  href="/login"
                  className="text-gray-700 hover:text-primary transition-colors"
                >
                  登录
                </a>
                <a
                  href="/register"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                >
                  注册
                </a>
              </div>
            </nav>

            {/* 移动端菜单按钮 */}
            <button
              className="md:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-primary transition-colors"
              onClick={toggleMobileMenu}
            >
              <span className="text-xl">{mobileMenu ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 移动端菜单 */}
      {mobileMenu && (
        <div className="md:hidden bg-white border-b border-gray-200 py-4 px-4">
          <nav>
            <ul className="space-y-4">
              {navigation.map(item => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    className={`block text-base font-medium ${item.active
                      ? 'text-primary'
                      : 'text-gray-700'}`}
                    onClick={() => handleNavItemClick(item)}
                  >
                    {item.title}
                  </a>
                  {/* 移动端下拉菜单 */}
                  {item.children && item.children.length > 0 && (
                    <ul className="mt-2 ml-4 space-y-2">
                      {item.children.map(child => (
                        <li key={child.id}>
                          <a
                            href={child.href}
                            className={`block text-sm ${child.active
                              ? 'text-primary'
                              : 'text-gray-600'}`}
                            onClick={() => handleNavItemClick(child)}
                          >
                            {child.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
              <li className="pt-4 border-t border-gray-100">
                <div className="flex flex-col gap-3">
                  <a
                    href="/login"
                    className="block text-center py-2 text-gray-700 hover:text-primary transition-colors"
                  >
                    登录
                  </a>
                  <a
                    href="/register"
                    className="block text-center py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                  >
                    注册
                  </a>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Hero区域 */}
      {hero && <section className="bg-gradient-to-r from-primary/5 to-primary/10 py-12">
        <div className="container mx-auto px-4">
          {hero}
        </div>
      </section>}

      {/* 主内容区 */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* 页脚 */}
      {footer ? (
        footer
      ) : (
        <footer className="bg-gray-900 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* 关于我们 */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <img
                    src="图片1.png"
                    alt="ValuHub Logo"
                    className="w-10 h-10 object-contain filter invert"
                  />
                  <span className="text-xl font-bold">ValuHub</span>
                </div>
                <p className="text-gray-400 mb-4">
                  房产价值生态引擎，为您提供专业、可靠的房产估价服务。
                </p>
                <div className="flex gap-4">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <span className="text-xl">📱</span>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <span className="text-xl">📧</span>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <span className="text-xl">🐦</span>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <span className="text-xl">🔗</span>
                  </a>
                </div>
              </div>

              {/* 产品服务 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">产品服务</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">AI估价</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">市场分析</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">数据报告</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API服务</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">解决方案</a></li>
                </ul>
              </div>

              {/* 关于我们 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">关于我们</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">公司介绍</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">团队成员</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">合作伙伴</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">新闻动态</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">加入我们</a></li>
                </ul>
              </div>

              {/* 联系方式 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">联系方式</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-gray-400">
                    <span>📍</span>
                    <span>北京市朝阳区XX大厦XX层</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-400">
                    <span>📞</span>
                    <span>400-123-4567</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-400">
                    <span>✉️</span>
                    <span>contact@valuhub.com</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 版权信息 */}
            <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
              <p>© 2025 ValuHub. 保留所有权利。</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default PublicLayout;