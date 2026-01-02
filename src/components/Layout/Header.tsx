import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeftOutlined,
  BellOutlined,
  SettingOutlined,
  DownOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Breadcrumb } from 'antd';
import messageUtils from '../../utils/messageUtils';

// 导入面包屑映射
import { breadcrumbMap } from '../../config/navConfig';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // 获取当前登录状态和用户信息
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const username = localStorage.getItem('username') || '未登录';
  const userRole = localStorage.getItem('userRole') || 'user';

  // 生成面包屑项
  const generateBreadcrumb = () => {
    const pathSegments = location.pathname
      .split('/')
      .filter((segment) => segment !== '');
    const breadcrumbItems = [{ name: '系统总览', path: '/' }];

    if (pathSegments.length > 0) {
      let currentPath = '';
      pathSegments.forEach((segment) => {
        currentPath += `/${segment}`;
        if (breadcrumbMap[currentPath]) {
          breadcrumbItems.push({
            name: breadcrumbMap[currentPath].name,
            path: currentPath,
          });
        }
      });
    }

    return breadcrumbItems;
  };

  // 切换下拉菜单显示
  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  // 关闭下拉菜单
  const closeDropdown = () => {
    setDropdownVisible(false);
  };

  // 登出函数
  const handleLogout = () => {
    // 清除登录状态
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    messageUtils.success('登出成功');
    // 重定向到登录页
    navigate('/login');
    closeDropdown();
  };

  // 前往登录页
  const goToLogin = () => {
    navigate('/login');
    closeDropdown();
  };

  // 用户菜单项
  const userMenuItems = isLoggedIn ? (
    <div
      className='user-dropdown-menu'
      style={{
        position: 'absolute',
        right: 0,
        top: '100%',
        marginTop: '4px',
        backgroundColor: '#2a2a2a',
        border: '1px solid #4E5969',
        borderRadius: '4px',
        padding: '8px 0',
        minWidth: '160px',
        zIndex: 1001,
      }}
    >
      <div style={{ padding: '8px 16px', borderBottom: '1px solid #4E5969' }}>
        <div style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff' }}>
          {username}
        </div>
        <div style={{ fontSize: '12px', color: '#86909C' }}>
          {userRole === 'admin'
            ? '管理员'
            : userRole === 'reviewer'
              ? '审核员'
              : '普通用户'}
        </div>
      </div>
      <div style={{ padding: '4px 0' }}>
        <button
          onClick={() => {
            navigate('/profile');
            closeDropdown();
          }}
          style={{
            display: 'block',
            width: '100%',
            padding: '8px 16px',
            textAlign: 'left',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          个人中心
        </button>
        <button
          onClick={() => {
            navigate('/settings');
            closeDropdown();
          }}
          style={{
            display: 'block',
            width: '100%',
            padding: '8px 16px',
            textAlign: 'left',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          系统设置
        </button>
      </div>
      <div style={{ padding: '4px 0' }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'block',
            width: '100%',
            padding: '8px 16px',
            textAlign: 'left',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#ff4d4f',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          退出登录
        </button>
      </div>
    </div>
  ) : (
    <div
      className='user-dropdown-menu'
      style={{
        position: 'absolute',
        right: 0,
        top: '100%',
        marginTop: '4px',
        backgroundColor: '#2a2a2a',
        border: '1px solid #4E5969',
        borderRadius: '4px',
        padding: '8px 0',
        minWidth: '160px',
        zIndex: 1001,
      }}
    >
      <button
        onClick={goToLogin}
        style={{
          display: 'block',
          width: '100%',
          padding: '8px 16px',
          textAlign: 'left',
          backgroundColor: 'transparent',
          border: 'none',
          color: '#ffffff',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        登录
      </button>
    </div>
  );

  return (
    <div className='bg-dark-200 h-16 border-b border-dark-100 flex items-center justify-between px-4 sm:px-6'>
      <div className='flex items-center gap-3 flex-1 overflow-hidden'>
        {!isHome && (
          <button
            onClick={() => navigate('/')}
            className='p-2 rounded-full hover:bg-dark-100 transition-colors'
            aria-label="返回首页"
          >
            <ArrowLeftOutlined />
          </button>
        )}
        <Breadcrumb style={{ flex: 1, overflow: 'hidden', fontSize: '14px' }}>
          {generateBreadcrumb().map((item, index, array) => {
            // 在移动端只显示当前页面
            if (window.innerWidth < 768 && index < array.length - 1) {
              return null;
            }
            return (
              <Breadcrumb.Item
                key={item.path}
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.path !== location.pathname ? (
                  <a
                    href='#'
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(item.path);
                    }}
                  >
                    {item.name}
                  </a>
                ) : (
                  <span>{item.name}</span>
                )}
              </Breadcrumb.Item>
            );
          })}
        </Breadcrumb>
      </div>

      <div className='flex items-center gap-3'>
        <button 
          className='p-2 rounded-full hover:bg-dark-100 transition-colors relative'
          aria-label="通知"
        >
          <BellOutlined />
          <span className='absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full'></span>
        </button>
        <button 
          className='p-2 rounded-full hover:bg-dark-100 transition-colors'
          aria-label="设置"
        >
          <SettingOutlined />
        </button>
        <div className='flex items-center gap-2 ml-1 relative nav-user'>
          <button
            className='user-btn p-1 rounded-full flex items-center gap-2'
            onClick={toggleDropdown}
            aria-expanded={dropdownVisible}
          >
            <Avatar size={28} icon={isLoggedIn ? null : <UserOutlined />}>
              {isLoggedIn ? username.charAt(0) : '未'}
            </Avatar>
            {/* 在移动端隐藏用户名 */}
            <span className='text-sm font-medium hidden sm:inline'>{username}</span>
            <DownOutlined className='hidden sm:inline' />
          </button>
          {dropdownVisible && userMenuItems}
        </div>
      </div>
    </div>
  );
};

export default Header;
