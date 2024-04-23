/**
 * The debounce function is used to limit the frequency of a function call by delaying its execution
 * until a certain amount of time has passed since the last invocation.
 * @param func - The `func` parameter is the function that you want to debounce. It is the function
 * that will be called after the debounce timeout has elapsed.
 * @param [timeout=300] - The `timeout` parameter is the amount of time in milliseconds that the
 * function should wait before executing the `func` function. If no `timeout` value is provided, it
 * defaults to 300 milliseconds.
 * @returns The debounce function returns a new function that will execute the provided `func` after a
 * specified `timeout` period has elapsed without the new function being called again.
 */
export function debounce(
  func: (...args: any[]) => void,
  timeout: number = 300
) {
  let timer: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}
