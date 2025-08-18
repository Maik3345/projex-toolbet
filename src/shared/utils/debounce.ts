/**
 * Creates and returns a debounced version of the provided function that delays its execution
 * until after a specified timeout has elapsed since the last time it was invoked.
 *
 * @param func - The function to debounce.
 * @param timeout - The number of milliseconds to delay; defaults to 300ms.
 * @returns A debounced function that postpones its execution until after the timeout.
 *
 * @remarks
 * Useful for limiting the rate at which a function can fire, such as handling user input events.
 *
 * @example
 * ```typescript
 * const debouncedLog = debounce(console.log, 500);
 * window.addEventListener('resize', debouncedLog);
 * ```
 */
export function debounce(func: (...args: any[]) => void, timeout: number = 300) {
  let timer: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}
