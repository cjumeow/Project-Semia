export type WebRestoreRetryOptions = {
  maxAttempts: number;
  intervalMs: number;
};

/**
 * Try restore immediately, then poll until success or attempts exhausted.
 * Returns a cancel function for the interval (no-op if already finished).
 */
export function runWebRestoreWithRetry(
  tryRestore: () => boolean,
  options: WebRestoreRetryOptions,
  onComplete: (ok: boolean) => void,
): () => void {
  if (tryRestore()) {
    onComplete(true);
    return () => {};
  }

  let attempts = 1;
  const timer = window.setInterval(() => {
    if (tryRestore()) {
      window.clearInterval(timer);
      onComplete(true);
      return;
    }

    attempts += 1;
    if (attempts >= options.maxAttempts) {
      window.clearInterval(timer);
      onComplete(false);
    }
  }, options.intervalMs);

  return () => window.clearInterval(timer);
}
