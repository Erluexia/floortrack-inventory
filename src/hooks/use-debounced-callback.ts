import { useCallback, useRef } from 'react';

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 1000
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      return new Promise<ReturnType<T>>((resolve) => {
        timeoutRef.current = setTimeout(async () => {
          const result = await callback(...args);
          resolve(result);
        }, delay);
      });
    },
    [callback, delay]
  );
}