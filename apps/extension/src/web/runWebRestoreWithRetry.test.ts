// @vitest-environment happy-dom

import { describe, expect, it, vi } from 'vitest';
import { runWebRestoreWithRetry } from './runWebRestoreWithRetry';

describe('runWebRestoreWithRetry', () => {
  it('completes immediately when the first try succeeds', () => {
    const onComplete = vi.fn();
    const cancel = runWebRestoreWithRetry(
      () => true,
      { maxAttempts: 3, intervalMs: 10 },
      onComplete,
    );

    expect(onComplete).toHaveBeenCalledWith(true);
    cancel();
  });

  it('retries until success', () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    let calls = 0;

    runWebRestoreWithRetry(
      () => {
        calls += 1;
        return calls >= 3;
      },
      { maxAttempts: 5, intervalMs: 100 },
      onComplete,
    );

    vi.advanceTimersByTime(200);
    expect(onComplete).toHaveBeenCalledWith(true);
    vi.useRealTimers();
  });

  it('reports failure after max attempts', () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();

    runWebRestoreWithRetry(
      () => false,
      { maxAttempts: 3, intervalMs: 100 },
      onComplete,
    );

    vi.advanceTimersByTime(300);
    expect(onComplete).toHaveBeenCalledWith(false);
    vi.useRealTimers();
  });
});
