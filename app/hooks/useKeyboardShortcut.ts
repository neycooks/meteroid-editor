'use client';

import { useCallback, useEffect, useRef } from 'react';

export function useKeyboardShortcut(key: string, callback: () => void, ctrlKey = false) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === key.toLowerCase() && e.ctrlKey === ctrlKey) {
        e.preventDefault();
        callbackRef.current();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, ctrlKey]);
}

// eslint-disable-next-line react-hooks/exhaustive-deps
export function useDebouncedCallback<T extends (...args: any[]) => any>(callback: T, delay: number): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    ((...args: any[]) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    }) as T,
    [delay]
  );
}
