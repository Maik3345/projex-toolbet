import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from './debounce';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should delay function execution by default timeout (300ms)', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn);

    debouncedFn();
    
    expect(mockFn).not.toHaveBeenCalled();
    
    vi.advanceTimersByTime(299);
    expect(mockFn).not.toHaveBeenCalled();
    
    vi.advanceTimersByTime(1);
    expect(mockFn).toHaveBeenCalledOnce();
  });

  it('should delay function execution by custom timeout', () => {
    const mockFn = vi.fn();
    const customTimeout = 500;
    const debouncedFn = debounce(mockFn, customTimeout);

    debouncedFn();
    
    expect(mockFn).not.toHaveBeenCalled();
    
    vi.advanceTimersByTime(499);
    expect(mockFn).not.toHaveBeenCalled();
    
    vi.advanceTimersByTime(1);
    expect(mockFn).toHaveBeenCalledOnce();
  });

  it('should reset timeout when called multiple times', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 300);

    debouncedFn();
    vi.advanceTimersByTime(200);
    
    debouncedFn(); // Reset the timer
    vi.advanceTimersByTime(200); // Only 200ms more, should not call yet
    
    expect(mockFn).not.toHaveBeenCalled();
    
    vi.advanceTimersByTime(100); // Now 300ms from last call
    expect(mockFn).toHaveBeenCalledOnce();
  });

  it('should only call function once even with multiple rapid calls', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 300);

    // Call multiple times rapidly
    debouncedFn();
    debouncedFn();
    debouncedFn();
    debouncedFn();
    
    expect(mockFn).not.toHaveBeenCalled();
    
    vi.advanceTimersByTime(300);
    expect(mockFn).toHaveBeenCalledOnce();
  });

  it('should pass arguments to the debounced function', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 300);

    const testArgs = ['arg1', 'arg2', 42];
    debouncedFn(...testArgs);
    
    vi.advanceTimersByTime(300);
    
    expect(mockFn).toHaveBeenCalledWith(...testArgs);
  });

  it('should preserve this context', () => {
    const mockObj = {
      value: 'test',
      fn: vi.fn(function(this: any) {
        return this.value;
      })
    };
    
    const debouncedFn = debounce(mockObj.fn, 300);
    
    debouncedFn.call(mockObj);
    vi.advanceTimersByTime(300);
    
    expect(mockObj.fn).toHaveBeenCalledOnce();
  });

  it('should use latest arguments when called multiple times', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 300);

    debouncedFn('first');
    debouncedFn('second'); 
    debouncedFn('third');
    
    vi.advanceTimersByTime(300);
    
    expect(mockFn).toHaveBeenCalledOnce();
    expect(mockFn).toHaveBeenCalledWith('third');
  });

  it('should handle zero timeout', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 0);

    debouncedFn();
    
    expect(mockFn).not.toHaveBeenCalled();
    
    vi.advanceTimersByTime(0);
    expect(mockFn).toHaveBeenCalledOnce();
  });

  it('should clear timeout when function is called again before timeout', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 1000);

    debouncedFn();
    vi.advanceTimersByTime(500);
    
    debouncedFn(); // This should clear the previous timeout
    vi.advanceTimersByTime(500); // Total 1000ms but only 500ms since last call
    
    expect(mockFn).not.toHaveBeenCalled();
    
    vi.advanceTimersByTime(500); // Now 1000ms since last call
    expect(mockFn).toHaveBeenCalledOnce();
  });
});
