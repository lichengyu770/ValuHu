import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { withLazyLoading, preloadComponent } from './LazyComponents';

// 测试组件1：简单的测试组件
const TestComponent = ({ message = 'Hello' }: { message?: string }) => {
  return <div data-testid="test-component">{message}</div>;
};



describe('LazyComponents', () => {
  describe('preloadComponent', () => {
    it('should preload a component and return it from cache on subsequent calls', async () => {
      // 模拟组件导入
      const mockImportFn = vi.fn().mockResolvedValue({ default: TestComponent });
      
      const preloaded = preloadComponent(mockImportFn);
      
      // 第一次调用应该触发导入
      const result1 = await preloaded();
      expect(mockImportFn).toHaveBeenCalledTimes(1);
      expect(result1.default).toBe(TestComponent);
      
      // 第二次调用应该从缓存获取，不触发导入
      const result2 = await preloaded();
      expect(mockImportFn).toHaveBeenCalledTimes(1);
      expect(result2.default).toBe(TestComponent);
    });
  });

  describe('withLazyLoading', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should render loading fallback when component is loading', async () => {
      // 创建一个延迟解析的导入函数
      const delayedImport = () => new Promise<{ default: typeof TestComponent }>((resolve) => {
        setTimeout(() => resolve({ default: TestComponent }), 100);
      });

      const LazyTestComponent = withLazyLoading(delayedImport, {
        componentName: 'Test Component'
      });

      render(<LazyTestComponent message="Test" />);
      
      // 应该显示加载指示器
      expect(screen.getByText(/加载Test Component中/i)).toBeInTheDocument();
      expect(screen.getByText(/系统正在为您准备最佳体验/i)).toBeInTheDocument();
    });

    it('should render the component when it loads successfully', async () => {
      const mockImportFn = vi.fn().mockResolvedValue({ default: TestComponent });
      
      const LazyTestComponent = withLazyLoading(mockImportFn, {
        componentName: 'Test Component'
      });

      render(<LazyTestComponent message="Test" />);
      
      // 等待组件加载完成
      await waitFor(() => {
        expect(screen.getByTestId('test-component')).toBeInTheDocument();
        expect(screen.getByText('Test')).toBeInTheDocument();
      });
    });

    it('should pass props to the lazy-loaded component', async () => {
      const mockImportFn = vi.fn().mockResolvedValue({ default: TestComponent });
      
      const LazyTestComponent = withLazyLoading(mockImportFn, {
        componentName: 'Test Component'
      });

      render(<LazyTestComponent message="Custom Prop" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('test-component')).toHaveTextContent('Custom Prop');
      });
    });

    it('should display error fallback when component fails to load', async () => {
      // 模拟组件加载失败
      const failingImport = () => Promise.reject(new Error('Failed to load component'));
      
      const LazyFailingComponent = withLazyLoading(failingImport, {
        componentName: 'Failing Component'
      });

      render(<LazyFailingComponent />);
      
      // 等待错误状态显示
      await waitFor(() => {
        expect(screen.getByText('组件加载失败')).toBeInTheDocument();
        expect(screen.getByText('Failed to load component')).toBeInTheDocument();
      });
    });

    it('should display retry button when retry is enabled', async () => {
      // 模拟组件加载失败
      const failingImport = () => Promise.reject(new Error('Failed to load component'));
      
      const LazyFailingComponent = withLazyLoading(failingImport, {
        componentName: 'Failing Component',
        retry: true
      });

      render(<LazyFailingComponent />);
      
      // 等待错误状态显示，检查重试按钮
      await waitFor(() => {
        expect(screen.getByText('重试')).toBeInTheDocument();
      });
    });

    it('should not display retry button when retry is disabled', async () => {
      // 模拟组件加载失败
      const failingImport = () => Promise.reject(new Error('Failed to load component'));
      
      const LazyFailingComponent = withLazyLoading(failingImport, {
        componentName: 'Failing Component',
        retry: false
      });

      render(<LazyFailingComponent />);
      
      // 等待错误状态显示，检查重试按钮不存在
      await waitFor(() => {
        expect(screen.queryByText('重试')).not.toBeInTheDocument();
      });
    });

    it('should call onError callback when component fails to load', async () => {
      const onErrorMock = vi.fn();
      const failingImport = () => Promise.reject(new Error('Failed to load component'));
      
      const LazyFailingComponent = withLazyLoading(failingImport, {
        componentName: 'Failing Component',
        onError: onErrorMock
      });

      render(<LazyFailingComponent />);
      
      // 等待错误状态显示，检查onError被调用
      await waitFor(() => {
        expect(onErrorMock).toHaveBeenCalledWith(expect.any(Error));
        expect(onErrorMock).toHaveBeenCalledTimes(1);
      });
    });

    it('should reload component when retry button is clicked', async () => {
      let attempt = 0;
      // 第一次调用失败，第二次调用成功
      const flakyImport = () => {
        attempt++;
        if (attempt === 1) {
          return Promise.reject(new Error('Failed to load component'));
        }
        return Promise.resolve({ default: TestComponent });
      };
      
      const LazyFlakyComponent = withLazyLoading(flakyImport, {
        componentName: 'Flaky Component',
        retry: true
      });

      render(<LazyFlakyComponent message="Test" />);
      
      // 等待错误状态显示
      await waitFor(() => {
        expect(screen.getByText('重试')).toBeInTheDocument();
      });
      
      // 点击重试按钮
      fireEvent.click(screen.getByText('重试'));
      
      // 等待组件加载成功
      await waitFor(() => {
        expect(screen.getByTestId('test-component')).toBeInTheDocument();
      });
    });

    it('should render in full screen mode when fullScreen is true', async () => {
      const mockImportFn = vi.fn().mockResolvedValue({ default: TestComponent });
      
      const LazyTestComponent = withLazyLoading(mockImportFn, {
        componentName: 'Test Component',
        fullScreen: true
      });

      render(<LazyTestComponent />);
      
      // 检查加载容器是否为全屏模式
      const loadingContainer = screen.getByText(/加载Test Component中/i).closest('div');
      expect(loadingContainer).toHaveStyle('min-height: 100vh');
      expect(loadingContainer).toHaveStyle('border-radius: 0');
    });

    it('should use custom component name in loading message', async () => {
      const mockImportFn = vi.fn().mockResolvedValue({ default: TestComponent });
      
      const LazyTestComponent = withLazyLoading(mockImportFn, {
        componentName: 'Custom Component Name'
      });

      render(<LazyTestComponent />);
      
      // 检查加载消息中是否包含自定义组件名称
      expect(screen.getByText(/加载Custom Component Name中/i)).toBeInTheDocument();
    });
  });
});
