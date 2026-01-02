import { useState, useEffect, useCallback } from 'react';

export interface WindowSize {
  width: number;
  height: number;
}

export function useWindowSize() {
  // 初始化窗口大小
  const [size, setSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  // 处理窗口大小变化
  const handleResize = useCallback(() => {
    setSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  // 添加窗口大小变化监听
  useEffect(() => {
    // 确保在客户端环境中运行
    if (typeof window === 'undefined') return;

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);

    // 监听屏幕方向变化（移动端）
    window.addEventListener('orientationchange', handleResize);

    // 清理函数，移除事件监听
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [handleResize]);

  return size;
}

// 扩展：添加断点判断功能
export function useBreakpoint() {
  const { width } = useWindowSize();

  // 定义断点
  const breakpoints = {
    xs: width < 576,
    sm: width >= 576 && width < 768,
    md: width >= 768 && width < 992,
    lg: width >= 992 && width < 1200,
    xl: width >= 1200 && width < 1600,
    xxl: width >= 1600,
  };

  // 返回当前断点
  const currentBreakpoint = Object.keys(breakpoints).find(
    (key) => breakpoints[key as keyof typeof breakpoints]
  ) as keyof typeof breakpoints;

  return {
    ...breakpoints,
    current: currentBreakpoint,
    width,
  };
}