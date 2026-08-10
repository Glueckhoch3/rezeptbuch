import { useEffect, useState } from 'react';

// Delays reflecting `value` until it has stopped changing for `delayMs`.
// Used by the ingredient/tag pickers so keystrokes don't each fire a request.
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}
