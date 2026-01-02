import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  DownOutlined,
  HomeOutlined,
  SearchOutlined,
  StarOutlined,
  StarFilled,
  BellOutlined,
  BellFilled,
  HistoryOutlined,
  UserOutlined,
  CloseOutlined,
  SettingsOutlined,
  LogoutOutlined,
} from '@ant-design/icons';

// 导入logo图片
import logo from '../../assets/images/logo.svg';
// 导入导航配置
import { navConfig, NavConfigItem, NavItem } from '../../config/navConfig';

// 定义通知接口
interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

// 定义最近访问接口
interface RecentlyVisitedItem {
  key: string;
  name: string;
  time: string;
}

// 定义分类导航项接口
interface CategoryNavItem extends NavConfigItem {
  items: NavItem[];
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    // 从localStorage加载收藏夹
    const saved = localStorage.getItem('sidebarFavorites');
    return saved ? JSON.parse(saved) : ['/', '/valuation-engine'];
  });
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: '新的评估报告已生成',
      message: '您的房产评估报告已完成，请查看',
      time: '2小时前',
      read: false,
    },
    {
      id: 2,
      title: '系统更新通知',
      message: '系统将于今晚23:00进行维护更新',
      time: '5小时前',
      read: true,
    },
    {
      id: 3,
      title: '数据导入完成',
      message: '最新的市场数据已成功导入',
      time: '1天前',
      read: true,
    },
  ]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [recentlyVisited, setRecentlyVisited] = useState<RecentlyVisitedItem[]>(
    []
  );
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 分类组织的导航项
  const navCategories: CategoryNavItem[] = useMemo(
    () => [
      {
        id: 'overview',
        name: '系统概览',
        icon: <HomeOutlined />,
        items: [
          {
            key: '/',
            icon: <HomeOutlined />,
            name: '系统总览',
            isSubMenu: false,
          },
        ],
      },
      ...navConfig,
    ],
    []
  );

  // 更新最近访问记录
  useEffect(() => {
    if (location.pathname !== '/') {
      setRecentlyVisited((prev) => {
        // 移除重复项
        const filtered = prev.filter((item) => item.key !== location.pathname);
        // 添加到开头
        const updated = [
          {
            key: location.pathname,
            name: getNavItemName(location.pathname),
            time: new Date().toLocaleTimeString(),
          },
          ...filtered,
        ];
        // 保留最近10条
        return updated.slice(0, 10);
      });
    }
  }, [location.pathname, getNavItemName, navCategories]);

  // 保存收藏夹到localStorage
  useEffect(() => {
    localStorage.setItem('sidebarFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // 切换折叠状态
  const toggleCollapse = useCallback((categoryId: string) => {
    setCollapsed((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  }, []);

  // 检查当前路由是否在某个分类下
  const isCategoryActive = useCallback(
    (category: CategoryNavItem) => {
      return category.items.some((item) => location.pathname === item.key);
    },
    [location.pathname]
  );

  // 检查当前导航项是否激活
  const isNavItemActive = useCallback(
    (key: string) => {
      return location.pathname === key;
    },
    [location.pathname]
  );

  // 导航到指定路径
  const handleNavigate = useCallback(
    (path: string) => {
      navigate(path);
      setShowSearch(false);
      setSearchQuery('');
    },
    [navigate]
  );

  // 切换收藏状态
  const toggleFavorite = useCallback((key: string) => {
    setFavorites((prev) => {
      if (prev.includes(key)) {
        return prev.filter((item) => item !== key);
      } else {
        return [...prev, key];
      }
    });
  }, []);

  // 检查是否收藏
  const isFavorite = useCallback(
    (key: string) => {
      return favorites.includes(key);
    },
    [favorites]
  );

  // 获取导航项名称
  const getNavItemName = useCallback(
    (key: string): string => {
      for (const category of navCategories) {
        const item = category.items.find((item) => item.key === key);
        if (item) {
          return item.name;
        }
      }
      return '未知页面';
    },
    [navCategories]
  );

  // 获取导航项图标
  const getNavItemIcon = useCallback(
    (key: string): React.ReactNode => {
      for (const category of navCategories) {
        const item = category.items.find((item) => item.key === key);
        if (item) {
          return item.icon;
        }
      }
      return <HomeOutlined />;
    },
    [navCategories]
  );

  // 过滤搜索结果
  const filteredNavItems = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const results: { category: string; items: NavItem[] }[] = [];
    for (const category of navCategories) {
      const matchedItems = category.items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (matchedItems.length > 0) {
        results.push({ category: category.name, items: matchedItems });
      }
    }
    return results;
  }, [searchQuery, navCategories]);

  // 切换搜索框显示
  const toggleSearch = useCallback(() => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      // 延迟聚焦，确保搜索框已经显示
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [showSearch]);

  // 标记通知为已读
  const markNotificationAsRead = useCallback((id: number) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  // 标记所有通知为已读
  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  }, []);

  // 删除通知
  const deleteNotification = useCallback((id: number) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  // 未读通知数量
  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((notification) => !notification.read).length;
  }, [notifications]);

  return (
    <div className='sidebar-container bg-[#1a0d08] w-72 h-screen p-4 flex flex-col border-r border-orange-400 border-opacity-20 shadow-xl transition-all duration-300 ease-in-out'>
      {/* 系统标题和操作区 */}
      <div className='sidebar-header-wrapper'>
        <div className='sidebar-header flex items-center gap-3 px-4 py-5 mb-6'>
          <div className='sidebar-logo w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-xl hover:shadow-[0_0_20px_rgba(255,160,70,0.4)] transition-all duration-300 transform hover:scale-105'>
            <img
              src={logo}
              alt='系统Logo'
              width='36'
              height='36'
              style={{ objectFit: 'contain' }}
            />
          </div>
          <h1 className='sidebar-title text-2xl font-bold bg-gradient-to-r from-white to-orange-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(255,160,70,0.3)]'>
            数智估价核心引擎
          </h1>
        </div>

        {/* 快捷操作栏 */}
        <div className='sidebar-actions flex items-center gap-2 px-4 mb-4'>
          <button
            className='action-btn w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.05)] flex items-center justify-center text-orange-400 hover:bg-[rgba(255,160,70,0.1)] hover:shadow-[0_0_15px_rgba(255,160,70,0.1)] transition-all duration-200'
            onClick={toggleSearch}
            title='搜索'
          >
            <SearchOutlined className='text-lg' />
          </button>
          <button
            className='action-btn w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.05)] flex items-center justify-center text-orange-400 hover:bg-[rgba(255,160,70,0.1)] hover:shadow-[0_0_15px_rgba(255,160,70,0.1)] transition-all duration-200 relative'
            onClick={() => setShowNotifications(!showNotifications)}
            title='通知'
          >
            {unreadNotificationsCount > 0 ? (
              <BellFilled className='text-lg' />
            ) : (
              <BellOutlined className='text-lg' />
            )}
            {unreadNotificationsCount > 0 && (
              <span className='notification-badge absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full shadow-lg'>
                {unreadNotificationsCount}
              </span>
            )}
          </button>
          <button
            className='action-btn w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.05)] flex items-center justify-center text-orange-400 hover:bg-[rgba(255,160,70,0.1)] hover:shadow-[0_0_15px_rgba(255,160,70,0.1)] transition-all duration-200'
            onClick={() => setShowSettings(!showSettings)}
            title='设置'
          >
            <SettingsOutlined className='text-lg' />
          </button>
        </div>
      </div>

      {/* 搜索框 */}
      {showSearch && (
        <div className='sidebar-search mb-4 px-4 animate-slideDown'>
          <div className='relative'>
            <input
              ref={searchInputRef}
              type='text'
              placeholder='搜索导航项...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full px-4 py-2 pr-10 rounded-xl bg-[rgba(255,255,255,0.05)] text-white placeholder:text-gray-500 border border-orange-400 border-opacity-20 focus:outline-none focus:border-orange-400 focus:shadow-[0_0_10px_rgba(255,160,70,0.2)] transition-all duration-200'
            />
            {searchQuery && (
              <button
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200'
                onClick={() => setSearchQuery('')}
                title='清除搜索'
              >
                <CloseOutlined className='text-sm' />
              </button>
            )}
          </div>

          {/* 搜索结果 */}
          {searchQuery && filteredNavItems.length > 0 && (
            <div className='search-results mt-3 bg-[rgba(255,255,255,0.05)] rounded-xl overflow-hidden shadow-lg max-h-60 overflow-y-auto'>
              {filteredNavItems.map(({ category, items }) => (
                <div key={category} className='search-result-group'>
                  <div className='search-result-category px-4 py-2 text-orange-400 text-sm font-semibold bg-[rgba(255,160,70,0.05)]'>
                    {category}
                  </div>
                  {items.map((item) => (
                    <div
                      key={item.key}
                      className={`search-result-item flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[rgba(255,160,70,0.1)] transition-all duration-200 ${isNavItemActive(item.key) ? 'bg-[rgba(255,160,70,0.1)] text-orange-400' : 'text-white'}`}
                      onClick={() => handleNavigate(item.key)}
                    >
                      <span className='text-sm text-orange-400'>
                        {item.icon}
                      </span>
                      <span className='flex-1 text-sm'>{item.name}</span>
                      <button
                        className='text-gray-400 hover:text-yellow-400 transition-colors duration-200'
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item.key);
                        }}
                        title={
                          isFavorite(item.key) ? '取消收藏' : '添加到收藏夹'
                        }
                      >
                        {isFavorite(item.key) ? (
                          <StarFilled />
                        ) : (
                          <StarOutlined />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {searchQuery && filteredNavItems.length === 0 && (
            <div className='search-no-results mt-3 p-4 text-center text-gray-500'>
              <p>未找到匹配的导航项</p>
            </div>
          )}
        </div>
      )}

      {/* 导航菜单 */}
      <div className='sidebar-menu flex-1 overflow-y-auto custom-scrollbar'>
        <div className='space-y-3'>
          {/* 收藏夹 */}
          <div className='sidebar-category group'>
            <div
              className='category-header flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 hover:bg-[rgba(64,158,255,0.1)] hover:text-blue-500 hover:shadow-[0_0_10px_rgba(64,158,255,0.1)]'
              onClick={() => toggleCollapse('favorites')}
              role='button'
              aria-expanded={!collapsed['favorites']}
              aria-controls='category-favorites'
            >
              <span className='category-icon text-lg text-blue-500 transition-transform duration-300 group-hover:scale-110'>
                <StarOutlined />
              </span>
              <span className='category-name flex-1 font-medium opacity-90 transition-opacity duration-300 group-hover:opacity-100'>
                我的收藏
              </span>
              <span
                className={`category-toggle text-blue-500 transition-all duration-300 transform ${collapsed['favorites'] ? 'rotate-180' : ''}`}
              >
                <DownOutlined />
              </span>
            </div>

            <div
              id='category-favorites'
              className={`category-items pl-6 pr-2 mt-2 space-y-1 transition-all duration-300 ease-in-out overflow-hidden ${collapsed['favorites'] ? 'max-h-0 opacity-0 translate-y-[-10px]' : 'max-h-[500px] opacity-100 translate-y-0'}`}
            >
              {favorites.map((key) => {
                const name = getNavItemName(key);
                const icon = getNavItemIcon(key);
                return (
                  <div
                    key={key}
                    className={`sidebar-item flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-300 ease-in-out ${isNavItemActive(key) ? 'bg-gradient-to-r from-blue-400/20 to-blue-500/10 text-blue-500 border border-blue-400/30 shadow-[0_0_15px_rgba(64,158,255,0.15)]' : 'text-gray-700 opacity-80 hover:text-blue-500 hover:bg-[rgba(255,255,255,0.1)] hover:shadow-[0_0_10px_rgba(64,158,255,0.1)]'}`}
                    onClick={() => handleNavigate(key)}
                    role='button'
                    aria-current={isNavItemActive(key) ? 'page' : false}
                  >
                    <span className='nav-item-icon text-sm text-blue-500 transition-transform duration-300 group-hover:scale-110'>
                      {icon}
                    </span>
                    <span className='nav-item-name text-base font-medium transition-all duration-300 flex-1'>
                      {name}
                    </span>
                    <button
                      className='text-gray-400 hover:text-red-400 transition-colors duration-200'
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(key);
                      }}
                      title='取消收藏'
                    >
                      <CloseOutlined className='text-xs' />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 最近访问 */}
          {recentlyVisited.length > 0 && (
            <div className='sidebar-category group'>
              <div
                className='category-header flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 hover:bg-[rgba(64,158,255,0.1)] hover:text-blue-500 hover:shadow-[0_0_10px_rgba(64,158,255,0.1)]'
                onClick={() => toggleCollapse('recent')}
                role='button'
                aria-expanded={!collapsed['recent']}
                aria-controls='category-recent'
              >
                <span className='category-icon text-lg text-blue-500 transition-transform duration-300 group-hover:scale-110'>
                  <HistoryOutlined />
                </span>
                <span className='category-name flex-1 font-medium opacity-90 transition-opacity duration-300 group-hover:opacity-100'>
                  最近访问
                </span>
                <span
                className={`category-toggle text-blue-500 transition-all duration-300 transform ${collapsed['recent'] ? 'rotate-180' : ''}`}
              >
                  <DownOutlined />
                </span>
              </div>

              <div
                id='category-recent'
                className={`category-items pl-6 pr-2 mt-2 space-y-1 transition-all duration-300 ease-in-out overflow-hidden ${collapsed['recent'] ? 'max-h-0 opacity-0 translate-y-[-10px]' : 'max-h-[500px] opacity-100 translate-y-0'}`}
              >
                {recentlyVisited.map(({ key, name, time }) => (
                  <div
                    key={key}
                    className={`sidebar-item flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-300 ease-in-out ${isNavItemActive(key) ? 'bg-gradient-to-r from-blue-400/20 to-blue-500/10 text-blue-500 border border-blue-400/30 shadow-[0_0_15px_rgba(64,158,255,0.15)]' : 'text-gray-700 opacity-80 hover:text-blue-500 hover:bg-[rgba(255,255,255,0.1)] hover:shadow-[0_0_10px_rgba(64,158,255,0.1)]'}`}
                    onClick={() => handleNavigate(key)}
                    role='button'
                    aria-current={isNavItemActive(key) ? 'page' : false}
                  >
                    <span className='nav-item-icon text-sm text-blue-500 transition-transform duration-300 group-hover:scale-110'>
                      {getNavItemIcon(key)}
                    </span>
                    <div className='flex-1'>
                      <div className='nav-item-name text-base font-medium transition-all duration-300'>
                        {name}
                      </div>
                      <div className='nav-item-time text-xs text-gray-500 mt-1'>
                        {time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 分类导航 */}
          {navCategories.map((category) => (
            <div key={category.id} className='sidebar-category group'>
              {/* 分类标题 - 可折叠 */}
              <div
                className={`category-header flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 ${isCategoryActive(category) ? 'bg-[rgba(64,158,255,0.1)] text-blue-500 shadow-[0_0_10px_rgba(64,158,255,0.1)]' : 'text-gray-700 hover:bg-[rgba(255,255,255,0.1)] hover:shadow-[0_0_15px_rgba(64,158,255,0.05)]'}`}
                onClick={() => toggleCollapse(category.id)}
                role='button'
                aria-expanded={!collapsed[category.id]}
                aria-controls={`category-${category.id}`}
              >
                <span className='category-icon text-lg text-blue-500 transition-transform duration-300 group-hover:scale-110'>
                  {category.icon}
                </span>
                <span className='category-name flex-1 font-medium opacity-90 transition-opacity duration-300 group-hover:opacity-100'>
                  {category.name}
                </span>
                <span
                className={`category-toggle text-blue-500 transition-all duration-300 transform ${collapsed[category.id] ? 'rotate-180' : ''}`}
              >
                  <DownOutlined />
                </span>
              </div>

              {/* 分类下的导航项 */}
              <div
                id={`category-${category.id}`}
                className={`category-items pl-6 pr-2 mt-2 space-y-1 transition-all duration-300 ease-in-out overflow-hidden ${collapsed[category.id] ? 'max-h-0 opacity-0 translate-y-[-10px]' : 'max-h-[500px] opacity-100 translate-y-0'}`}
              >
                {category.items.map((item) => (
                  <div
                    key={item.key}
                    className={`sidebar-item flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-300 ease-in-out ${isNavItemActive(item.key) ? 'bg-gradient-to-r from-orange-400/20 to-orange-500/10 text-orange-400 border border-orange-400/30 shadow-[0_0_15px_rgba(255,160,70,0.15)]' : 'text-white opacity-80 hover:text-orange-300 hover:bg-[rgba(255,255,255,0.05)] hover:shadow-[0_0_10px_rgba(255,160,70,0.1)]'}`}
                    onClick={() => handleNavigate(item.key)}
                    role='button'
                    aria-current={isNavItemActive(item.key) ? 'page' : false}
                  >
                    <span className='nav-item-icon text-sm text-orange-400 transition-transform duration-300 group-hover:scale-110'>
                      {item.icon}
                    </span>
                    <span className='nav-item-name text-base font-medium transition-all duration-300 flex-1'>
                      {item.name}
                    </span>
                    <button
                      className='text-gray-400 hover:text-yellow-400 transition-colors duration-200'
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item.key);
                      }}
                      title={isFavorite(item.key) ? '取消收藏' : '添加到收藏夹'}
                    >
                      {isFavorite(item.key) ? <StarFilled /> : <StarOutlined />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 用户信息和设置 */}
      <div className='sidebar-footer-wrapper'>
        {/* 通知面板 */}
        {showNotifications && (
          <div className='notifications-panel absolute bottom-20 left-4 right-4 bg-[#1a0d08] border border-orange-400 border-opacity-20 rounded-xl shadow-xl overflow-hidden z-50 max-h-80 overflow-y-auto animate-slideUp'>
            <div className='notifications-header px-4 py-3 border-b border-orange-400 border-opacity-20 flex items-center justify-between'>
              <h3 className='text-white font-medium'>通知中心</h3>
              <div className='flex items-center gap-2'>
                <button
                  className='text-sm text-orange-400 hover:text-orange-300 transition-colors duration-200'
                  onClick={markAllNotificationsAsRead}
                >
                  全部已读
                </button>
                <button
                  className='text-gray-400 hover:text-white transition-colors duration-200'
                  onClick={() => setShowNotifications(false)}
                >
                  <CloseOutlined className='text-sm' />
                </button>
              </div>
            </div>

            <div className='notifications-list'>
              {notifications.length === 0 ? (
                <div className='notifications-empty p-4 text-center text-gray-500'>
                  <p>暂无通知</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item px-4 py-3 border-b border-orange-400 border-opacity-20 hover:bg-[rgba(255,160,70,0.05)] transition-all duration-200 ${!notification.read ? 'bg-[rgba(255,160,70,0.05)]' : ''}`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className='notification-content'>
                      <div className='flex items-center justify-between'>
                        <h4 className='notification-title text-white font-medium'>
                          {notification.title}
                        </h4>
                        <span className='notification-time text-xs text-gray-500'>
                          {notification.time}
                        </span>
                      </div>
                      <p className='notification-message text-sm text-gray-300 mt-1'>
                        {notification.message}
                      </p>
                    </div>
                    <button
                      className='notification-delete text-gray-400 hover:text-red-400 transition-colors duration-200 ml-2'
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    >
                      <CloseOutlined className='text-xs' />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 用户信息 */}
        <div className='sidebar-footer mt-auto pt-4 border-t border-orange-400 border-opacity-20 bg-[rgba(255,160,70,0.05)] p-4 rounded-xl transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,160,70,0.1)] relative'>
          <div className='flex items-center gap-4 px-2'>
            <div className='user-avatar w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-lg hover:shadow-[0_0_20px_rgba(255,160,70,0.4)] transition-all duration-300 transform hover:scale-105'>
              <svg
                width='24'
                height='24'
                viewBox='0 0 100 100'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M45.5,15.5 L74.5,15.5 L74.5,44.5 L57.5,44.5 L57.5,28.5 L45.5,28.5 Z'
                  fill='white'
                />
                <path
                  d='M45.5,28.5 L57.5,28.5 L57.5,44.5 L74.5,44.5 L74.5,73.5 L45.5,73.5 Z'
                  fill='white'
                />
                <path
                  d='M25.5,44.5 L45.5,44.5 L45.5,73.5 L16.5,73.5 L16.5,44.5 Z'
                  fill='white'
                />
                <path
                  d='M57.5,44.5 L74.5,44.5 L74.5,57.5 L57.5,57.5 Z'
                  fill='#ff7e46'
                />
                <path
                  d='M45.5,57.5 L57.5,57.5 L57.5,73.5 L45.5,73.5 Z'
                  fill='#1a73e8'
                />
                <path
                  d='M16.5,57.5 L45.5,57.5 L45.5,73.5 L16.5,73.5 Z'
                  fill='#ff7e46'
                />
              </svg>
            </div>
            <div className='user-info flex-1'>
              <p className='user-company text-base font-semibold text-white'>
                湖南智信评估
              </p>
              <p className='user-role text-xs text-orange-400'>管理员</p>
            </div>
          </div>

          {/* 用户操作菜单 */}
          {showSettings && (
            <div className='user-settings absolute bottom-full left-0 right-0 bg-[#1a0d08] border border-orange-400 border-opacity-20 rounded-xl shadow-xl overflow-hidden z-50 animate-slideUp'>
              <div className='user-setting-item flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[rgba(255,160,70,0.1)] transition-all duration-200 text-white'>
                <SettingsOutlined className='text-orange-400' />
                <span className='flex-1 text-sm'>系统设置</span>
              </div>
              <div className='user-setting-item flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[rgba(255,160,70,0.1)] transition-all duration-200 text-white'>
                <UserOutlined className='text-orange-400' />
                <span className='flex-1 text-sm'>个人资料</span>
              </div>
              <div className='user-setting-item flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[rgba(255,160,70,0.1)] transition-all duration-200 text-white'>
                <BellOutlined className='text-orange-400' />
                <span className='flex-1 text-sm'>通知设置</span>
              </div>
              <div className='user-setting-item flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[rgba(255,160,70,0.1)] transition-all duration-200 text-red-400'>
                <LogoutOutlined className='text-red-400' />
                <span className='flex-1 text-sm'>退出登录</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 自定义滚动条样式 */}
      <style jsx global>{`
        /* 自定义滚动条样式 */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 160, 70, 0.3) transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
          margin: 10px 0;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 160, 70, 0.3);
          border-radius: 3px;
          transition: background 0.3s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 160, 70, 0.5);
        }

        /* 侧边栏容器 */
        .sidebar-container {
          backdrop-filter: blur(10px);
          position: relative;
        }

        /* 导航项动画效果 */
        .sidebar-item {
          position: relative;
          overflow: hidden;
        }

        .sidebar-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 3px;
          background: linear-gradient(to bottom, #ffa046, #ff7e46);
          transform: scaleY(0);
          transition: transform 0.3s ease;
          border-radius: 0 3px 3px 0;
        }

        .sidebar-item:hover::before,
        .sidebar-item[aria-current='page']::before {
          transform: scaleY(1);
        }

        /* 分类标题动画 */
        .category-header {
          position: relative;
        }

        .category-header::after {
          content: '';
          position: absolute;
          left: 4px;
          top: 50%;
          transform: translateY(-50%);
          height: 0;
          width: 2px;
          background: linear-gradient(
            to bottom,
            transparent,
            #ffa046,
            transparent
          );
          transition: height 0.3s ease;
          opacity: 0;
        }

        .category-header:hover::after,
        .category-header[aria-expanded='true']::after {
          height: 70%;
          opacity: 1;
        }

        /* 淡入动画 */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* 滑动动画 */
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* 分类项进入动画 */
        .category-items > div {
          animation: fadeInUp 0.3s ease-out forwards;
        }

        .category-items > div:nth-child(1) {
          animation-delay: 0.05s;
        }
        .category-items > div:nth-child(2) {
          animation-delay: 0.1s;
        }
        .category-items > div:nth-child(3) {
          animation-delay: 0.15s;
        }
        .category-items > div:nth-child(4) {
          animation-delay: 0.2s;
        }
        .category-items > div:nth-child(5) {
          animation-delay: 0.25s;
        }
        .category-items > div:nth-child(6) {
          animation-delay: 0.3s;
        }
        .category-items > div:nth-child(7) {
          animation-delay: 0.35s;
        }

        /* 搜索框动画 */
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }

        /* 通知面板和设置面板动画 */
        .animate-slideUp {
          animation: slideUp 0.3s ease-out forwards;
        }

        /* 悬停效果增强 */
        .sidebar-logo,
        .user-avatar,
        .action-btn {
          position: relative;
          z-index: 1;
        }

        .sidebar-logo::before,
        .user-avatar::before,
        .action-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(
            45deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          transform: scaleX(0);
          transition: transform 0.5s ease;
          z-index: -1;
        }

        .sidebar-logo:hover::before,
        .user-avatar:hover::before,
        .action-btn:hover::before {
          transform: scaleX(1);
        }

        /* 文字渐变动画 */
        .sidebar-title {
          background-size: 200% auto;
          animation: textGradient 3s ease-in-out infinite;
        }

        @keyframes textGradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        /* 通知徽章 */
        .notification-badge {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
