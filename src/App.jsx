import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import router from './routes';
import { initializeAuthComponents } from './components/Auth';
import AuthService from './services/AuthService';
import './styles/global.css';
import './styles/page.css';

function App() {
  useEffect(() => {
    // 初始化认证组件
    initializeAuthComponents();
    
    // 检查登录状态
    const user = AuthService.getCurrentUser();
    if (user) {
      console.log('用户已登录:', user.name);
    }
  }, []);

  return (
    <ConfigProvider 
      locale={zhCN} 
      theme={{ 
        token: { 
          colorPrimary: '#ffa046',
          borderRadius: 8
        } 
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}

export default App;