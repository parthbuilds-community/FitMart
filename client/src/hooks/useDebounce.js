import { useState, useEffect } from 'react';

/**
 * Debounce a value by the specified delay.
 * Returns the debounced value, which updates only after `delay` ms
 * of inactivity since the last change.
 *
 * @param {*} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default: 300)
 * @returns {*} The debounced value
 */
export default function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
