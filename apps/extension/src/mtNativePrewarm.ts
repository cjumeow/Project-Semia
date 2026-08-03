import {
  isCoarseNativeTrack,
  isTlangPairingReliable,
  validateNativeTrackLength,
} from './cuePairing';
import { toGtxTargetLanguage } from './gtxTargetLanguage';
import {
  DEFAULT_CUE_BATCH_SIZE,
  translateCueBatch,
} from './translateCueBatch';
import type { StoredTranscript } from './types';
import {
  loadMtNativeCacheEntry,
  mapToMtCacheTranslations,
  mtCacheToMap,
  saveMtNativeCacheEntry,
} from './mtNativeCacheStorage';

export const MT_PREWARM_CONCURRENCY = 12;
export const NATIVE_LINE_LOADING_TEXT = '翻譯載入中';

export type MtPrewarmStatus = 'idle' | 'loading' | 'complete' | 'failed';

export type MtPrewarmMetrics = {
  batchCount: number;
  succeededBatches: number;
  failedBatches: number;
  cueCount: number;
  translatedCueCount: number;
  durationMs: number;
  rateLimited: boolean;
};

export function shouldPrewarmMtNativeLine(transcript: StoredTranscript): boolean {
  const nativeLang = transcript.nativeLanguageCode?.trim();
  if (!nativeLang || transcript.languageCode === nativeLang) return false;
  if (!transcript.segments.length) return false;
  if (transcript.nativeTrackUnavailable) return true;
  const nativeCount = transcript.nativeSegments?.length ?? 0;
  const nativeSegments = transcript.nativeSegments ?? [];
  const learningCount = transcript.segments.length;
  return (
    nativeCount === 0 ||
    isCoarseNativeTrack(learningCount, nativeCount) ||
    validateNativeTrackLength(learningCount, nativeCount) !== null ||
    !isTlangPairingReliable(transcript.segments, nativeSegments)
  );
}

function chunkIndices(total: number, batchSize: number): number[][] {
  const chunks: number[][] = [];
  for (let start = 0; start < total; start += batchSize) {
    const indices: number[] = [];
    for (let i = start; i < Math.min(start + batchSize, total); i++) {
      indices.push(i);
    }
    chunks.push(indices);
  }
  return chunks;
}

async function runPool<T>(
  tasks: Array<() => Promise<T>>,
  concurrency: number,
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let next = 0;

  async function worker(): Promise<void> {
    while (next < tasks.length) {
      const index = next++;
      results[index] = await tasks[index]!();
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, tasks.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export async function runMtNativePrewarm(options: {
  transcript: StoredTranscript;
  batchSize?: number;
  concurrency?: number;
  signal?: AbortSignal;
  onProgress?: (translations: Map<number, string>, status: MtPrewarmStatus) => void;
}): Promise<{
  translations: Map<number, string>;
  status: MtPrewarmStatus;
  metrics: MtPrewarmMetrics;
}> {
  const { transcript, signal, onProgress } = options;
  const batchSize = options.batchSize ?? DEFAULT_CUE_BATCH_SIZE;
  const concurrency = options.concurrency ?? MT_PREWARM_CONCURRENCY;
  const nativeLang = transcript.nativeLanguageCode?.trim() || 'zh-TW';
  const sourceLang = transcript.languageCode.trim() || 'en';
  const targetLang = toGtxTargetLanguage(nativeLang);

  const started = performance.now();
  const translations = mtCacheToMap(
    await loadMtNativeCacheEntry(transcript.videoId, nativeLang),
  );

  const segments = transcript.segments;
  const allIndices = segments.map((_, i) => i);
  const missingIndices = allIndices.filter((i) => !translations.has(i));

  if (!missingIndices.length) {
    onProgress?.(translations, 'complete');
    return {
      translations,
      status: 'complete',
      metrics: {
        batchCount: 0,
        succeededBatches: 0,
        failedBatches: 0,
        cueCount: segments.length,
        translatedCueCount: translations.size,
        durationMs: 0,
        rateLimited: false,
      },
    };
  }

  onProgress?.(translations, 'loading');

  const chunks = chunkIndices(segments.length, batchSize).filter((chunk) =>
    chunk.some((i) => !translations.has(i)),
  );

  let succeededBatches = 0;
  let failedBatches = 0;
  let rateLimited = false;

  const tasks = chunks.map((chunkIndices) => async () => {
    if (signal?.aborted) return;

    const cueTexts = chunkIndices.map((i) => segments[i]!.text);
    let attempt = 0;
    while (attempt < 3) {
      if (signal?.aborted) return;
      try {
        const translated = await translateCueBatch({
          cueTexts,
          sourceLang,
          targetLang,
          signal,
        });
        for (let j = 0; j < chunkIndices.length; j++) {
          const text = translated[j]?.trim();
          if (text) translations.set(chunkIndices[j]!, text);
        }
        succeededBatches++;
        onProgress?.(new Map(translations), 'loading');
        await saveMtNativeCacheEntry({
          videoId: transcript.videoId,
          nativeLanguageCode: nativeLang,
          translations: mapToMtCacheTranslations(translations),
          updatedAt: new Date().toISOString(),
        });
        return;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (message.includes('429')) {
          rateLimited = true;
          attempt++;
          await sleep(300 * 2 ** attempt);
          continue;
        }
        failedBatches++;
        console.warn('[Semia] MT prewarm batch failed:', message);
        return;
      }
    }
    failedBatches++;
  });

  await runPool(tasks, concurrency);

  const durationMs = Math.round(performance.now() - started);
  const status: MtPrewarmStatus =
    translations.size === 0 && failedBatches > 0
      ? 'failed'
      : translations.size > 0
        ? 'complete'
        : 'failed';

  const metrics: MtPrewarmMetrics = {
    batchCount: chunks.length,
    succeededBatches,
    failedBatches,
    cueCount: segments.length,
    translatedCueCount: translations.size,
    durationMs,
    rateLimited,
  };

  console.info('[Semia] MT native prewarm metrics', metrics);

  onProgress?.(translations, status);
  return { translations, status, metrics };
}
