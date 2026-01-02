import { useState, useEffect, useCallback, useRef } from 'react';

// 节流值Hook
export function useThrottle<T>(value: T, delay: number = 300): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdateTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTimeRef.current;

    if (timeSinceLastUpdate >= delay) {
      // 如果距离上次更新已经超过延迟时间，立即更新值
      lastUpdateTimeRef.current = now;
      setThrottledValue(value);
    } else {
      // 否则，设置定时器在剩余时间后更新值
      const timer = setTimeout(() => {
        lastUpdateTimeRef.current = Date.now();
        setThrottledValue(value);
      }, delay - timeSinceLastUpdate);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [value, delay]);

  return throttledValue;
}

// 节流函数Hook
export function useThrottleFn<Args extends any[]>(
  fn: (...args: Args) => void,
  delay: number = 300
) {
  const [isThrottling, setIsThrottling] = useState(false);
  const lastCallTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const throttledFn = useCallback(
    (...args: Args) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTimeRef.current;

      // 如果距离上次调用已经超过延迟时间，立即执行函数
      if (timeSinceLastCall >= delay) {
        lastCallTimeRef.current = now;
        fn(...args);
      } else {
        // 否则，设置定时器在剩余时间后执行函数
        if (!timerRef.current) {
          setIsThrottling(true);
          timerRef.current = setTimeout(() => {
            lastCallTimeRef.current = Date.now();
            fn(...args);
            setIsThrottling(false);
            timerRef.current = null;
          }, delay - timeSinceLastCall);
        }
      }
    },
    [fn, delay]
  );

  // 立即执行函数，不等待节流延迟
  const executeNow = useCallback(
    (...args: Args) => {
      // 清除定时器
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      
      // 立即执行函数
      lastCallTimeRef.current = Date.now();
      fn(...args);
      setIsThrottling(false);
    },
    [fn]
  );

  // 取消节流
  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      setIsThrottling(false);
    }
  }, []);

  return {
    throttledFn,
    isThrottling,
    executeNow,
    cancel,
  };
}