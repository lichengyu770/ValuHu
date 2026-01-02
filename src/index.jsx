import 'vite/modulepreload-polyfill';
import React, { useEffect, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider, Spin } from 'antd';
import './styles/index.css';
import router from './routes';
import { registerServiceWorker } from './utils/registerServiceWorker';
import KnowledgeMemoryService from './services/KnowledgeMemoryService.js';

// 全局错误处理
const errorHandler = (error) => {
  console.error('全局错误:', error);
  // 可以在这里添加错误上报逻辑
};

// 设置全局错误处理器
window.addEventListener('error', errorHandler);
window.addEventListener('unhandledrejection', (event) => {
  errorHandler(event.reason);
});

// 监听Vite预加载错误并刷新页面
window.addEventListener('vite:preloadError', (event) => {
  window.location.reload(); // 例如，刷新页面
});

// 监听PWA安装事件
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  // 阻止默认行为
  e.preventDefault();
  // 存储事件以便稍后使用
  deferredPrompt = e;
  window.deferredPrompt = deferredPrompt;
});

// 全局加载指示器
const GlobalLoadingFallback = () => {
  return (
    <div className='fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-80 z-50'>
      <Spin
        size='large'
        tip='加载中...'
        style={{
          color: '#165DFF',
          fontSize: '16px',
        }}
      />
    </div>
  );
};

const App = () => {
  // 注册Service Worker和初始化知识记忆服务
  useEffect(() => {
    const initServices = async () => {
      try {
        // 初始化知识记忆服务
        KnowledgeMemoryService.init();
        // 注册Service Worker
        await registerServiceWorker();
      } catch (error) {
        console.error('初始化服务失败:', error);
      }
    };

    initServices();
  }, []);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#ffa046',
          colorBgContainer: '#1a0d08',
          colorText: '#ffffff',
          colorTextSecondary: 'rgba(255, 255, 255, 0.7)',
          borderRadius: 8,
          colorBorder: 'rgba(255, 160, 70, 0.2)',
        },
      }}
    >
      <Suspense fallback={<GlobalLoadingFallback />}>
        <RouterProvider router={router} />
      </Suspense>
    </ConfigProvider>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);
