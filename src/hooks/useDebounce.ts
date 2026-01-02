import { useState, useEffect, useCallback } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 设置定时器
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 清除定时器
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// 防抖函数Hook
export function useDebounceFn<Args extends any[]>(
  fn: (...args: Args) => void,
  delay: number = 300
) {
  const [isDebouncing, setIsDebouncing] = useState(false);
  const timerRef = useState<NodeJS.Timeout | null>(null)[0];

  const debouncedFn = useCallback(
    (...args: Args) => {
      setIsDebouncing(true);

      // 清除之前的定时器
      if (timerRef) {
        clearTimeout(timerRef);
      }

      // 设置新的定时器
      const newTimer = setTimeout(() => {
        fn(...args);
        setIsDebouncing(false);
      }, delay);

      // 更新定时器引用
      (timerRef as any) = newTimer;
    },
    [fn, delay, timerRef]
  );

  // 立即执行函数，不等待防抖延迟
  const executeNow = useCallback(
    (...args: Args) => {
      // 清除定时器
      if (timerRef) {
        clearTimeout(timerRef);
      }
      
      // 立即执行函数
      fn(...args);
      setIsDebouncing(false);
    },
    [fn, timerRef]
  );

  // 取消防抖
  const cancel = useCallback(() => {
    if (timerRef) {
      clearTimeout(timerRef);
      setIsDebouncing(false);
    }
  }, [timerRef]);

  return {
    debouncedFn,
    isDebouncing,
    executeNow,
    cancel,
  };
}