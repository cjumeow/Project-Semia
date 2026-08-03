import { describe, expect, it, vi } from 'vitest';
import {
  createMtPrewarmSession,
  runPriorityChunkPool,
  setMtPrewarmPriorityCue,
} from './mtPrewarmPool';

describe('runPriorityChunkPool', () => {
  it('runs the priority batch before later FIFO chunks', async () => {
    const chunks = [
      [0, 1],
      [2, 3],
      [4, 5],
      [6, 7],
      [8, 9],
    ];
    const order: number[] = [];
    const session = createMtPrewarmSession(8);

    await runPriorityChunkPool(
      chunks,
      session,
      async (chunk) => {
        order.push(chunk[0]!);
      },
      1,
    );

    expect(order[0]).toBe(8);
    expect(order).toEqual([8, 0, 2, 4, 6]);
  });

  it('re-prioritizes when priorityCueIndex changes mid-run', async () => {
    const chunks = [
      [0, 1],
      [2, 3],
      [4, 5],
      [6, 7],
      [8, 9],
      [10, 11],
    ];
    const order: number[] = [];
    const session = createMtPrewarmSession(0);

    await runPriorityChunkPool(
      chunks,
      session,
      async (chunk) => {
        order.push(chunk[0]!);
        if (chunk[0] === 0) {
          setMtPrewarmPriorityCue(session, 10);
        }
      },
      1,
    );

    expect(order[0]).toBe(0);
    expect(order[1]).toBe(10);
  });
});
