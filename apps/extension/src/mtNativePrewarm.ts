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
  priorityCueIndex?: number;
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

export function buildCueBatchChunks(
  total: number,
  batchSize: number,
): number[][] {
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

export function batchChunkForCue(
  total: number,
  cueIndex: number,
  batchSize: number,
): number[] {
  if (cueIndex < 0 || cueIndex >= total) return [];
  const batchStart = Math.floor(cueIndex / batchSize) * batchSize;
  const indices: number[] = [];
  for (let i = batchStart; i < Math.min(batchStart + batchSize, total); i++) {
    indices.push(i);
  }
  return indices;
}

/** Move the batch containing `priorityCueIndex` to the front for faster visible-cue MT. */
export function orderChunksByPriorityCue(
  chunks: number[][],
  priorityCueIndex: number | undefined,
  _batchSize: number,
): number[][] {
  if (priorityCueIndex === undefined || priorityCueIndex < 0 || !chunks.length) {
    return chunks;
  }
  const chunkIdx = chunks.findIndex((chunk) => chunk.includes(priorityCueIndex));
  if (chunkIdx <= 0) return chunks;
  return [
    chunks[chunkIdx]!,
    ...chunks.slice(0, chunkIdx),
    ...chunks.slice(chunkIdx + 1),
  ];
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

type BatchTranslationContext = {
  transcript: StoredTranscript;
  segments: StoredTranscript['segments'];
  sourceLang: string;
  targetLang: string;
  nativeLang: string;
  translations: Map<number, string>;
  signal?: AbortSignal;
};

async function executeBatchTranslation(
  chunkIndices: number[],
  ctx: BatchTranslationContext,
): Promise<{ ok: true } | { ok: false; rateLimited: boolean }> {
  const cueTexts = chunkIndices.map((i) => ctx.segments[i]!.text);
  let attempt = 0;
  while (attempt < 3) {
    if (ctx.signal?.aborted) return { ok: false, rateLimited: false };
    try {
      const translated = await translateCueBatch({
        cueTexts,
        sourceLang: ctx.sourceLang,
        targetLang: ctx.targetLang,
        signal: ctx.signal,
      });
      for (let j = 0; j < chunkIndices.length; j++) {
        const text = translated[j]?.trim();
        if (text) ctx.translations.set(chunkIndices[j]!, text);
      }
      await saveMtNativeCacheEntry({
        videoId: ctx.transcript.videoId,
        nativeLanguageCode: ctx.nativeLang,
        translations: mapToMtCacheTranslations(ctx.translations),
        updatedAt: new Date().toISOString(),
      });
      return { ok: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('429')) {
        attempt++;
        await sleep(300 * 2 ** attempt);
        continue;
      }
      console.warn('[Semia] MT prewarm batch failed:', message);
      return { ok: false, rateLimited: false };
    }
  }
  return { ok: false, rateLimited: true };
}

/** On-demand GTX for the batch containing a visible cue (seek / resume). */
export async function translateCueBatchIfMissing(options: {
  transcript: StoredTranscript;
  cueIndex: number;
  translations: Map<number, string>;
  batchSize?: number;
  signal?: AbortSignal;
}): Promise<Map<number, string>> {
  const { transcript, cueIndex, translations, signal } = options;
  const batchSize = options.batchSize ?? DEFAULT_CUE_BATCH_SIZE;
  const segments = transcript.segments;
  if (cueIndex < 0 || cueIndex >= segments.length) return translations;
  if (translations.has(cueIndex)) return translations;

  const chunkIndices = batchChunkForCue(segments.length, cueIndex, batchSize);
  if (!chunkIndices.length || chunkIndices.every((i) => translations.has(i))) {
    return translations;
  }

  const nativeLang = transcript.nativeLanguageCode?.trim() || 'zh-TW';
  const sourceLang = transcript.languageCode.trim() || 'en';
  const targetLang = toGtxTargetLanguage(nativeLang);

  const result = await executeBatchTranslation(chunkIndices, {
    transcript,
    segments,
    sourceLang,
    targetLang,
    nativeLang,
    translations,
    signal,
  });

  if (!result.ok && result.rateLimited) {
    console.warn('[Semia] Priority cue batch rate limited');
  }

  return translations;
}

export async function runMtNativePrewarm(options: {
  transcript: StoredTranscript;
  batchSize?: number;
  concurrency?: number;
  priorityCueIndex?: number;
  /** Shared mutable map — merges with cache; used by priority on-demand path. */
  translations?: Map<number, string>;
  signal?: AbortSignal;
  onProgress?: (translations: Map<number, string>, status: MtPrewarmStatus) => void;
}): Promise<{
  translations: Map<number, string>;
  status: MtPrewarmStatus;
  metrics: MtPrewarmMetrics;
}> {
  const { transcript, signal, onProgress, priorityCueIndex } = options;
  const batchSize = options.batchSize ?? DEFAULT_CUE_BATCH_SIZE;
  const concurrency = options.concurrency ?? MT_PREWARM_CONCURRENCY;
  const nativeLang = transcript.nativeLanguageCode?.trim() || 'zh-TW';
  const sourceLang = transcript.languageCode.trim() || 'en';
  const targetLang = toGtxTargetLanguage(nativeLang);

  const started = performance.now();
  const cached = mtCacheToMap(
    await loadMtNativeCacheEntry(transcript.videoId, nativeLang),
  );
  const translations = options.translations ?? new Map<number, string>();
  if (options.translations) {
    for (const [index, text] of cached) {
      if (!translations.has(index)) translations.set(index, text);
    }
  } else {
    for (const [index, text] of cached) translations.set(index, text);
  }

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
        priorityCueIndex,
      },
    };
  }

  onProgress?.(translations, 'loading');

  const chunks = orderChunksByPriorityCue(
    buildCueBatchChunks(segments.length, batchSize).filter((chunk) =>
      chunk.some((i) => !translations.has(i)),
    ),
    priorityCueIndex,
    batchSize,
  );

  let succeededBatches = 0;
  let failedBatches = 0;
  let rateLimited = false;

  const ctx: BatchTranslationContext = {
    transcript,
    segments,
    sourceLang,
    targetLang,
    nativeLang,
    translations,
    signal,
  };

  const tasks = chunks.map((chunkIndices) => async () => {
    if (signal?.aborted) return;
    const result = await executeBatchTranslation(chunkIndices, ctx);
    if (result.ok) {
      succeededBatches++;
      onProgress?.(translations, 'loading');
      return;
    }
    if (result.rateLimited) rateLimited = true;
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
    priorityCueIndex,
  };

  console.info('[Semia] MT native prewarm metrics', metrics);

  onProgress?.(translations, status);
  return { translations, status, metrics };
}
