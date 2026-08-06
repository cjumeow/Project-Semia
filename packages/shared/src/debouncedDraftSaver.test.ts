import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDebouncedDraftSaver } from './debouncedDraftSaver';

describe('createDebouncedDraftSaver', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('saves after the debounce delay', async () => {
    const save = vi.fn();
    const saver = createDebouncedDraftSaver({ delayMs: 300, save });

    saver.schedule('first');
    expect(save).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(300);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith('first');
  });

  it('coalesces rapid updates into one save with the latest value', async () => {
    const save = vi.fn();
    const saver = createDebouncedDraftSaver({ delayMs: 300, save });

    saver.schedule('a');
    await vi.advanceTimersByTimeAsync(100);
    saver.schedule('b');
    await vi.advanceTimersByTimeAsync(100);
    saver.schedule('c');
    await vi.advanceTimersByTimeAsync(300);

    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith('c');
  });

  it('flush saves immediately and cancels the pending timer', async () => {
    const save = vi.fn();
    const saver = createDebouncedDraftSaver({ delayMs: 300, save });

    saver.schedule('pending');
    await saver.flush();

    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith('pending');

    await vi.advanceTimersByTimeAsync(300);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('cancel drops a pending save without writing', async () => {
    const save = vi.fn();
    const saver = createDebouncedDraftSaver({ delayMs: 300, save });

    saver.schedule('drop-me');
    saver.cancel();
    await vi.advanceTimersByTimeAsync(300);

    expect(save).not.toHaveBeenCalled();
  });
});
