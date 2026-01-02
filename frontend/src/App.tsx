import React from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd-mobile';
import zhCN from 'antd-mobile/es/locales/zh-CN';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { store } from './store';
import PropertyValuation from './components/PropertyValuation';
import ModelTraining from './pages/ModelTraining';
import DataLab from './pages/DataLab';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5分钟
    },
    mutations: {
      retry: 2,
    }
  }
});

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider locale={zhCN}>
          <Router>
            <div className="app">
              <header className="app-header">
                <h1>ValuHub - 房产价值生态引擎</h1>
              </header>
              <main className="app-main">
                <Routes>
                  <Route path="/" element={<PropertyValuation />} />
                  <Route path="/valuation" element={<PropertyValuation />} />
                  <Route path="/model-training" element={<ModelTraining />} />
                  <Route path="/data-lab" element={<DataLab />} />
                </Routes>
              </main>
              <footer className="app-footer">
                <p>© 2025 ValuHub. 保留所有权利。</p>
              </footer>
            </div>
          </Router>
        </ConfigProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
