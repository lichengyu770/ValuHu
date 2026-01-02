import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import AuthService from '../../services/auth/AuthService';
// import LogService from '../../services/LogService';
// import BrowserUtils from '../../utils/browserUtils';
import Sidebar from './Sidebar';
import {
  HomeOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  BarChartOutlined,
  UserOutlined,
  SettingOutlined,
  BellOutlined,
  LockOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';

// 定义菜单项接口
interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  title: string;
  permission: string;
  children?: MenuItem[];
}



// 添加全局样式
const GlobalStyles: React.FC = () => {
  return (
    <style jsx global>{`
      /* 全局科技感样式 */
      :root {
        --tech-blue: #409eff;
        --tech-light: #f8f9fa;
        --tech-glass: rgba(255, 255, 255, 0.95);
      }

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'Inter', sans-serif;
        transition: all 0.3s ease;
      }

      body {
        background: var(--tech-light);
        color: #333;
        overflow-x: hidden;
      }

      /* 页面容器（路由切换区域） */
      .page-container {
        width: 100%;
        min-height: 100vh;
        position: relative;
        opacity: 0;
        transform: translateY(20px) scale(0.98);
        transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .page-container.active {
        opacity: 1;
        transform: translateY(0) scale(1);
      }

      /* 导航链接悬停效果 */
      .nav-link {
        position: relative;
        overflow: hidden;
      }

      .nav-link::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 0;
        height: 2px;
        background: var(--tech-blue);
        transition: width 0.3s ease;
      }

      .nav-link:hover::after {
        width: 100%;
      }

      /* 按钮微动画 */
      button {
        transition: all 0.2s ease;
      }

      button:active {
        transform: scale(0.95);
      }

      /* 卡片悬停效果 */
      .card {
        transition: all 0.3s ease;
      }

      .card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      }
    `}</style>
  );
};

const Layout: React.FC = () => {
  const location = useLocation();



  // 基于权限的菜单项配置
  const allMenuItems: MenuItem[] = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Home',
      title: 'Next-Generation Visual',
      permission: 'view_dashboard',
    },
    {
      key: '/work',
      icon: <HomeOutlined />,
      label: 'Work',
      title: 'Our Projects',
      permission: 'view_work',
    },
    {
      key: '/services',
      icon: <FileTextOutlined />,
      label: 'Services',
      title: 'Our Services',
      permission: 'view_services',
    },
    {
      key: '/pricing',
      icon: <BarChartOutlined />,
      label: 'Pricing',
      title: 'Pricing Plans',
      permission: 'view_pricing',
    },
    {
      key: '/about',
      icon: <UserOutlined />,
      label: 'About',
      title: 'About Us',
      permission: 'view_about',
    },
    {
      key: '/gis',
      icon: <EnvironmentOutlined />,
      label: 'GIS评估',
      title: '基于地理信息的房产评估',
      permission: 'view_gis',
    },
    {
      key: '/building',
      icon: <HomeOutlined />,
      label: '楼盘可视化',
      title: '三维楼盘展示与信息查询',
      permission: 'view_building',
    },
    {
      key: '/encryption',
      icon: <LockOutlined />,
      label: '数据加密',
      title: '敏感数据加密与安全管理',
      permission: 'view_encryption',
    },
    {
      key: '/cert',
      icon: <FileTextOutlined />,
      label: '电子凭证',
      title: '房产凭证数字化存储与管理',
      permission: 'view_cert',
    },
    {
      key: '/revenue',
      icon: <BarChartOutlined />,
      label: '收益评估',
      title: '房产投资收益分析与价值评估',
      permission: 'view_revenue',
    },
    {
      key: '/system',
      icon: <SettingOutlined />,
      label: '系统管理',
      title: '系统设置与管理',
      permission: 'manage_system',
      children: [
        {
          key: '/system/users',
          icon: <UserOutlined />,
          label: '用户管理',
          title: '用户管理',
          permission: 'manage_users',
        },
        {
          key: '/system/logs',
          icon: <FileTextOutlined />,
          label: '操作日志',
          title: '操作日志',
          permission: 'view_logs',
        },
        {
          key: '/system/monitor',
          icon: <BarChartOutlined />,
          label: '系统监控',
          title: '系统监控',
          permission: 'view_monitor',
        },
        {
          key: '/system/data',
          icon: <FileTextOutlined />,
          label: '数据管理',
          title: '数据管理',
          permission: 'manage_data',
        },
      ],
    },
  ];



  // 过滤用户有权限的菜单项
  const getMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter((item) => {
        // 如果没有指定权限，或者用户有权限，则显示
        if (!item.permission || AuthService.hasPermission(item.permission)) {
          // 如果有子菜单，递归过滤
          if (item.children) {
            const filteredChildren = getMenuItems(item.children);
            if (filteredChildren.length > 0) {
              item.children = filteredChildren;
              return true;
            }
            // 如果子菜单都没有权限，且没有直接权限，则不显示
            return (
              !item.permission || AuthService.hasPermission(item.permission)
            );
          }
          return true;
        }
        return false;
      })
      .map((item) => {
        // 移除permission属性，Ant Design不认识这个属性
        const { permission: _, ...menuItem } = item;
        return menuItem;
      });
  };

  // 获取当前用户信息
  const currentUser = AuthService.getCurrentUser();
  const menuItems = getMenuItems(allMenuItems);

  const currentPath = location.pathname;
  const currentMenuItem = menuItems.find((item) => item.key === currentPath);



  return (
    <div className='flex h-screen overflow-hidden bg-[#f8f9fa]'>
      <GlobalStyles />

      {/* 侧边栏 - 仅在桌面显示 */}
      <div className='hidden lg:block'>
        <Sidebar />
      </div>

      {/* 主内容区域 */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        {/* 顶部导航栏 - 现代扁平化设计 */}
        <header className='z-100 backdrop-filter blur(12px) bg-white border-b border-gray-200 shadow-sm'>
          <nav className='navbar p-4 md:p-6 flex justify-between items-center max-w-[1920px] mx-auto'>
            <div className='logo text-gray-800 text-xl font-bold tracking-wider flex items-center gap-2'>
              <HomeOutlined className='text-blue-500' />
              <span>智慧房产管理系统</span>
            </div>
            <div className='nav-links flex gap-6'>
              {menuItems.slice(0, 5).map((item) => (
                <Link
                  key={item.key}
                  to={item.key}
                  className={`nav-link text-gray-700 hover:text-blue-500 transition-colors duration-200 ${currentPath === item.key ? 'text-blue-500 font-medium' : 'opacity-80 hover:opacity-100'}`}
                  data-path={item.key}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className='flex items-center gap-4'>
              {/* 通知图标 - 仅在桌面显示 */}
              <button className='relative p-2 hover:bg-[rgba(64,158,255,0.1)] rounded-full transition-colors'>
                <BellOutlined className='text-gray-700 text-lg' />
                <span className='absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full'></span>
              </button>

              {/* 帮助图标 - 仅在桌面显示 */}
              <button className='p-2 hover:bg-[rgba(64,158,255,0.1)] rounded-full transition-colors'>
                <QuestionCircleOutlined className='text-gray-700 text-lg' />
              </button>

              {/* 用户头像 - 仅在桌面显示 */}
              <div className='relative'>
                <button className='flex items-center gap-2 p-2 hover:bg-[rgba(64,158,255,0.1)] rounded-full transition-colors'>
                  <div className='w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center'>
                    <UserOutlined className='text-white' />
                  </div>
                  <span className='text-gray-700 hidden md:inline'>
                    {currentUser?.name || '管理员'}
                  </span>
                </button>
              </div>
            </div>
          </nav>
        </header>

        {/* 内容区域 */}
        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='page-container active max-w-[1920px] mx-auto'>
            {currentMenuItem?.title && (
              <div className='mb-6 text-sm text-gray-500'>
                {currentMenuItem.title}
              </div>
            )}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
