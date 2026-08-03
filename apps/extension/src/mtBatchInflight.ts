export type BatchFlightResult =
  | { ok: true }
  | { ok: false; rateLimited: boolean };

const inflight = new Map<string, Promise<BatchFlightResult>>();

export function mtBatchInflightKey(
  videoId: string,
  nativeLanguageCode: string,
  batchIndex: number,
): string {
  return `${videoId}:${nativeLanguageCode}:${batchIndex}`;
}

export function batchIndexForCue(cueIndex: number, batchSize: number): number {
  return Math.floor(cueIndex / batchSize);
}

/** One GTX request per batch — background and seek paths share the same promise. */
export async function runMtBatchOnce(
  key: string,
  run: () => Promise<BatchFlightResult>,
): Promise<BatchFlightResult> {
  const pending = inflight.get(key);
  if (pending) return pending;

  const promise = run().finally(() => {
    if (inflight.get(key) === promise) {
      inflight.delete(key);
    }
  });
  inflight.set(key, promise);
  return promise;
}

/** @internal test helper */
export function clearMtBatchInflightForTests(): void {
  inflight.clear();
}
