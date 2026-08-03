export type MtPrewarmSession = {
  priorityCueIndex: number | undefined;
};

export function createMtPrewarmSession(
  priorityCueIndex?: number,
): MtPrewarmSession {
  return { priorityCueIndex };
}

export function setMtPrewarmPriorityCue(
  session: MtPrewarmSession | null | undefined,
  cueIndex: number,
): void {
  if (!session || cueIndex < 0) return;
  session.priorityCueIndex = cueIndex;
}

/**
 * Workers prefer the batch containing session.priorityCueIndex, then FIFO.
 * priorityCueIndex may change while the pool is running (seek).
 */
export async function runPriorityChunkPool(
  chunks: number[][],
  session: MtPrewarmSession,
  runChunk: (chunkIndices: number[]) => Promise<void>,
  concurrency: number,
  signal?: AbortSignal,
): Promise<void> {
  if (!chunks.length) return;

  const pending = new Set(chunks.map((_, index) => index));

  function pickNextIndex(): number | undefined {
    const priority = session.priorityCueIndex;
    if (priority !== undefined && priority >= 0) {
      for (const index of pending) {
        if (chunks[index]!.includes(priority)) return index;
      }
    }
    return pending.values().next().value;
  }

  async function worker(): Promise<void> {
    while (!signal?.aborted) {
      const index = pickNextIndex();
      if (index === undefined) return;
      pending.delete(index);
      await runChunk(chunks[index]!);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, chunks.length) }, () => worker()),
  );
}
