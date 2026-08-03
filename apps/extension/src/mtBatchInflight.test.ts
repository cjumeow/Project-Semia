import { describe, expect, it, vi } from 'vitest';
import {
  clearMtBatchInflightForTests,
  mtBatchInflightKey,
  runMtBatchOnce,
} from './mtBatchInflight';

describe('runMtBatchOnce', () => {
  it('dedupes concurrent runs for the same batch key', async () => {
    clearMtBatchInflightForTests();
    const run = vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5));
      return { ok: true as const };
    });
    const key = mtBatchInflightKey('vid', 'zh-TW', 3);

    const [a, b] = await Promise.all([
      runMtBatchOnce(key, run),
      runMtBatchOnce(key, run),
    ]);

    expect(run).toHaveBeenCalledOnce();
    expect(a).toEqual({ ok: true });
    expect(b).toEqual({ ok: true });
  });

  it('allows a new run after the prior flight completes', async () => {
    clearMtBatchInflightForTests();
    const key = mtBatchInflightKey('vid', 'zh-TW', 1);
    const run = vi.fn(async () => ({ ok: true as const }));

    await runMtBatchOnce(key, run);
    await runMtBatchOnce(key, run);

    expect(run).toHaveBeenCalledTimes(2);
  });
});
