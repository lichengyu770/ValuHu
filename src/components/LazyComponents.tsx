import { lazy, Suspense, ComponentType } from 'react';
import { Spin, Result, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

// 加载指示器配置接口
interface LoadingConfig {
  componentName?: string;
  fullScreen?: boolean;
  delay?: number;
  timeout?: number;
}

// 懒加载包装器配置接口
interface LazyWrapperProps {
  importFn: () => Promise<{ default: ComponentType<any> }>;
  componentName?: string;
  onError?: (error: Error) => void;
  retry?: boolean;
  fullScreen?: boolean;
  delay?: number;
}

// 错误状态组件
const ErrorFallback = ({ error, retry }: { error: Error; retry?: () => void }) => (
  <div className='flex items-center justify-center p-8 bg-gray-50 rounded-md'>
    <Result
      status="error"
      title="组件加载失败"
      subTitle={error.message}
      extra={
        retry ? (
          <Button type="primary" onClick={retry} icon={<ReloadOutlined />}>
            重试
          </Button>
        ) : null
      }
    />
  </div>
);

// 加载指示器组件
const LoadingFallback = ({ componentName = '组件', fullScreen = false }: LoadingConfig) => (
  <div 
    className={`flex items-center justify-center p-8 ${fullScreen ? 'h-screen w-screen' : 'bg-gray-50 rounded-md'}`}
    style={{ 
      minHeight: fullScreen ? '100vh' : '200px',
      background: fullScreen ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      borderRadius: fullScreen ? '0' : '12px',
      boxShadow: fullScreen ? 'none' : '0 4px 24px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}
  >
    <Spin 
      tip={`加载${componentName}中...`} 
      size="large"
      style={{ color: '#ffa046' }}
    />
    <p className="text-gray-500 text-sm">
      系统正在为您准备最佳体验，请稍候...
    </p>
  </div>
);

// 通用懒加载包装器
const withLazyLoading = <P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  config: LazyWrapperProps
): ComponentType<P> => {
  const { 
          componentName = '组件', 
          onError,
          retry = true, 
          fullScreen = false
        } = config;

  // 创建可重试的懒加载组件
  const RetryLazyComponent = () => {
    const [error, setError] = React.useState<Error | null>(null);
    const [retryCount, setRetryCount] = React.useState(0);

    // 重置错误状态
    const handleRetry = () => {
      setError(null);
      setRetryCount(prev => prev + 1);
    };

    // 使用key强制重新渲染以触发重新加载
    return (
      <>
        {error ? (
          <ErrorFallback error={error} retry={retry ? handleRetry : undefined} />
        ) : (
          <Suspense fallback={<LoadingFallback componentName={componentName} fullScreen={fullScreen} />}>
            <LazyComponentWrapper 
              importFn={importFn} 
              onError={(err) => {
                setError(err);
                if (onError) onError(err);
              }}
              key={retryCount}
            />
          </Suspense>
        )}
      </>
    );
  };

  // 懒加载组件包装器
  const LazyComponentWrapper = React.memo(({ importFn, onError }: { importFn: () => Promise<{ default: ComponentType<any> }>; onError: (error: Error) => void }) => {
    const [isMounted, setIsMounted] = React.useState(false);

    // 使用useEffect确保组件在挂载后加载
    React.useEffect(() => {
      setIsMounted(true);
      return () => {
        setIsMounted(false);
      };
    }, []);

    // 实际的懒加载组件
    const LazyComponent = lazy(importFn);

    // 捕获组件加载错误
    React.useEffect(() => {
      // 使用Promise.resolve确保异步加载
      Promise.resolve(importFn()).catch((err) => {
        if (isMounted) {
          onError(err);
        }
      });
    }, [importFn, onError, isMounted]);

    return <LazyComponent />;
  });

  return RetryLazyComponent as ComponentType<P>;
};

// 预加载组件函数
export const preloadComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): (() => Promise<{ default: T }>) => {
  let promise: Promise<{ default: T }> | null = null;

  return () => {
    if (!promise) {
      promise = importFn();
    }
    return promise;
  };
};

// 懒加载地图相关组件
export const LazyBaiduMapComponent = withLazyLoading(() => import('./BaiduMapComponent'), {
  componentName: '百度地图',
  retry: true,
  fullScreen: false
});

// 懒加载数据可视化相关组件
export const LazyReportGenerator = withLazyLoading(() => import('./ReportGenerator'), {
  componentName: '报表生成器',
  retry: true,
  fullScreen: false
});

// 懒加载复杂表单组件
export const LazyMobileForm = withLazyLoading(() => import('./MobileForm'), {
  componentName: '移动端表单',
  retry: true,
  fullScreen: false
});



// 懒加载系统卡片组件集合
export const LazySystemCard = withLazyLoading(() => import('./SystemCard'), {
  componentName: '系统卡片',
  retry: true,
  fullScreen: false
});





// 懒加载估价矩阵组件
export const LazyValuationMatrix = withLazyLoading(() => import('./ValuationMatrix'), {
  componentName: '估价矩阵',
  retry: true,
  fullScreen: false
});

// 懒加载属性参数组组件
export const LazyPropertyParamsGroup = withLazyLoading(() => import('./PropertyParamsGroup'), {
  componentName: '属性参数组',
  retry: true,
  fullScreen: false
});

// 导出通用懒加载包装器
export { withLazyLoading };

export default {
  LazyBaiduMapComponent,
  LazyReportGenerator,
  LazyMobileForm,
  LazySystemCard,
  LazyValuationMatrix,
  LazyPropertyParamsGroup
};
