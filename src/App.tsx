import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import router from './routes';
import { initializeAuthComponents } from './components/Auth';
import AuthService from './services/auth/AuthService';
import { DataServiceProvider } from './services/data/DataService';
import './styles/global.css';
import './styles/page.css';

function App() {
  useEffect(() => {
    // 初始化认证组件
    initializeAuthComponents();

    // 检查登录状态
    const user = AuthService.getCurrentUser();
    if (user) {
      // 用户已登录，无需额外操作
    }

    // 初始化安全服务
    import('./services/security/SecurityService').then(({ default: securityService }) => {
      securityService.initializeSecurityFeatures();
    });
    
    // 初始化监控服务
    import('./services/monitoring/MonitoringService').then(({ default: monitoringService }) => {
      monitoringService.initialize();
    });
  }, []);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#ffa046',
          borderRadius: 8,
        },
      }}
    >
      <DataServiceProvider>
        <RouterProvider router={router} />
      </DataServiceProvider>
    </ConfigProvider>
  );
}

export default App;
