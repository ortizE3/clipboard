import { useEffect } from 'react';

export default function useDebouncedEffect(
  callback: any,
  deps: any,
  delay: number,
) {
  useEffect(() => {
    const handler = setTimeout(() => {
      callback();
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [...deps, delay]);
}
