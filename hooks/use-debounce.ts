/**
 * @file hooks/use-debounce.ts
 * @description Custom hook for debouncing values
 * @created 2025-10-18
 */

import { useEffect, useState } from 'react';

/**
* Returns a debounced version of the provided value after a specified delay.
* @example
* useDebounce('search term', 500)
* // 'search term' (returned after 500 ms of no changes)
* @param {*} value - The value to debounce.
* @param {number} [delay=300] - Delay in milliseconds before updating the debounced value.
* @returns {*} The debounced value.
**/
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
