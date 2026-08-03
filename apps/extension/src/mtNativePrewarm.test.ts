import { describe, expect, it, vi, beforeEach } from 'vitest';
import { DEFAULT_CUE_BATCH_SIZE } from './translateCueBatch';
import {
  orderChunksByPriorityCue,
  runMtNativePrewarm,
  shouldPrewarmMtNativeLine,
  translateCueBatchIfMissing,
} from './mtNativePrewarm';
import type { StoredTranscript } from './types';
import * as translateCueBatchModule from './translateCueBatch';
import * as mtNativeCacheStorage from './mtNativeCacheStorage';
import { clearMtBatchInflightForTests } from './mtBatchInflight';

vi.mock('./translateCueBatch', async (importOriginal) => {
  const actual = await importOriginal<typeof translateCueBatchModule>();
  return { ...actual, translateCueBatch: vi.fn() };
});

vi.mock('./mtNativeCacheStorage', () => ({
  loadMtNativeCacheEntry: vi.fn().mockResolvedValue(null),
  saveMtNativeCacheEntry: vi.fn().mockResolvedValue(undefined),
  mtCacheToMap: vi.fn().mockReturnValue(new Map()),
  mapToMtCacheTranslations: vi.fn().mockReturnValue({}),
}));

function transcript(
  overrides: Partial<StoredTranscript> = {},
): StoredTranscript {
  return {
    videoId: 'abc',
    videoUrl: 'https://www.youtube.com/watch?v=abc',
    languageCode: 'en',
    capturedAt: new Date().toISOString(),
    source: 'interceptedTimedtextUrl',
    segments: [{ text: 'hi', start: 0, duration: 1 }],
    nativeLanguageCode: 'zh-TW',
    nativeSegments: [{ text: '你好', start: 0, duration: 1 }],
    ...overrides,
  };
}

function buildChunks(total: number, batchSize: number): number[][] {
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

describe('orderChunksByPriorityCue', () => {
  it('moves the batch containing the priority cue to the front', () => {
    const chunks = buildChunks(100, 10);
    const ordered = orderChunksByPriorityCue(chunks, 55, 10);
    expect(ordered[0]).toEqual([50, 51, 52, 53, 54, 55, 56, 57, 58, 59]);
    expect(ordered).toHaveLength(10);
    expect(new Set(ordered.flat()).size).toBe(100);
  });

  it('returns chunks unchanged when priority is in the first batch', () => {
    const chunks = buildChunks(30, 10);
    expect(orderChunksByPriorityCue(chunks, 3, 10)).toEqual(chunks);
  });

  it('returns chunks unchanged when priority cue is undefined', () => {
    const chunks = buildChunks(30, 10);
    expect(orderChunksByPriorityCue(chunks, undefined, 10)).toBe(chunks);
  });
});

describe('runMtNativePrewarm', () => {
  const translateCueBatch = vi.mocked(translateCueBatchModule.translateCueBatch);

  beforeEach(() => {
    translateCueBatch.mockReset();
    translateCueBatch.mockImplementation(async (options) =>
      options.cueTexts.map((text) => `zh:${text}`),
    );
    vi.mocked(mtNativeCacheStorage.mtCacheToMap).mockReturnValue(new Map());
    clearMtBatchInflightForTests();
  });

  it('translates the priority cue batch before later batches', async () => {
    const segments = Array.from({ length: 30 }, (_, i) => ({
      text: `cue-${i}`,
      start: i,
      duration: 1,
    }));
    const firstBatchTexts: string[] = [];

    translateCueBatch.mockImplementation(async (options) => {
      if (!firstBatchTexts.length) {
        firstBatchTexts.push(...options.cueTexts);
      }
      return options.cueTexts.map((text) => `zh:${text}`);
    });

    await runMtNativePrewarm({
      transcript: transcript({ segments }),
      priorityCueIndex: 25,
      concurrency: 1,
    });

    expect(firstBatchTexts).toEqual(
      Array.from({ length: 10 }, (_, i) => `cue-${i + 20}`),
    );
  });
});

describe('translateCueBatchIfMissing', () => {
  const translateCueBatch = vi.mocked(translateCueBatchModule.translateCueBatch);

  beforeEach(() => {
    translateCueBatch.mockReset();
    translateCueBatch.mockResolvedValue(['zh:hello']);
  });

  it('skips GTX when the cue is already cached', async () => {
    const translations = new Map([[5, '已有']]);
    const result = await translateCueBatchIfMissing({
      transcript: transcript({
        segments: Array.from({ length: 10 }, (_, i) => ({
          text: `cue-${i}`,
          start: i,
          duration: 1,
        })),
      }),
      cueIndex: 5,
      translations,
    });
    expect(translateCueBatch).not.toHaveBeenCalled();
    expect(result).toBe(translations);
  });

  it('translates the batch containing the missing cue', async () => {
    translateCueBatch.mockResolvedValue(
      Array.from({ length: 10 }, (_, i) => `zh-${i}`),
    );
    const translations = new Map<number, string>();
    const segments = Array.from({ length: 20 }, (_, i) => ({
      text: `cue-${i}`,
      start: i,
      duration: 1,
    }));

    const result = await translateCueBatchIfMissing({
      transcript: transcript({ segments }),
      cueIndex: 15,
      translations,
    });

    expect(translateCueBatch).toHaveBeenCalledOnce();
    expect(translateCueBatch.mock.calls[0]?.[0].cueTexts).toEqual(
      Array.from({ length: 10 }, (_, i) => `cue-${i + 10}`),
    );
    expect(result.get(15)).toBe('zh-5');
  });

  it('awaits an in-flight batch instead of firing duplicate GTX', async () => {
    clearMtBatchInflightForTests();
    translateCueBatch.mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return Array.from({ length: 10 }, (_, i) => `zh-${i}`);
    });
    const segments = Array.from({ length: 20 }, (_, i) => ({
      text: `cue-${i}`,
      start: i,
      duration: 1,
    }));
    const t = transcript({ segments });
    const translations = new Map<number, string>();

    await Promise.all([
      translateCueBatchIfMissing({ transcript: t, cueIndex: 12, translations }),
      translateCueBatchIfMissing({ transcript: t, cueIndex: 15, translations }),
    ]);

    expect(translateCueBatch).toHaveBeenCalledOnce();
    expect(translations.get(12)).toBe('zh-2');
    expect(translations.get(15)).toBe('zh-5');
  });
});

describe('shouldPrewarmMtNativeLine', () => {
  it('returns true for coarse native tracks', () => {
    const t = transcript({
      segments: Array.from({ length: 100 }, (_, i) => ({
        text: `cue ${i}`,
        start: i,
        duration: 1,
      })),
      nativeSegments: Array.from({ length: 40 }, (_, i) => ({
        text: `native ${i}`,
        start: i,
        duration: 1,
      })),
    });
    expect(shouldPrewarmMtNativeLine(t)).toBe(true);
  });

  it('returns false when native track is 1:1 and pairs reliably', () => {
    const t = transcript({
      segments: [
        { text: 'a', start: 0, duration: 1 },
        { text: 'b', start: 1, duration: 1 },
      ],
      nativeSegments: [
        { text: '甲', start: 0, duration: 1 },
        { text: '乙', start: 1, duration: 1 },
      ],
    });
    expect(shouldPrewarmMtNativeLine(t)).toBe(false);
  });

  it('returns true when cue counts differ but ratio is above coarse threshold', () => {
    const t = transcript({
      segments: Array.from({ length: 100 }, (_, i) => ({
        text: `learning ${i}`,
        start: i,
        duration: 1,
      })),
      nativeSegments: Array.from({ length: 80 }, (_, i) => ({
        text: `native ${i}`,
        start: i,
        duration: 1,
      })),
    });
    expect(shouldPrewarmMtNativeLine(t)).toBe(true);
  });

  it('returns true when non-coarse tlang fails pairing gates', () => {
    const t = transcript({
      segments: Array.from({ length: 20 }, (_, i) => ({
        text: `learning cue ${i}`,
        start: i * 2,
        duration: 1,
      })),
      nativeSegments: Array.from({ length: 20 }, (_, i) => ({
        text: `native cue ${i} with much longer merged translation text`,
        start: i * 2 + 5,
        duration: 8,
      })),
    });
    expect(shouldPrewarmMtNativeLine(t)).toBe(true);
  });

  it('returns true when native track is missing', () => {
    expect(
      shouldPrewarmMtNativeLine(
        transcript({ nativeSegments: [], nativeLanguageCode: 'zh-TW' }),
      ),
    ).toBe(true);
  });

  it('returns true when nativeTrackUnavailable even with stale native segments', () => {
    const t = transcript({
      nativeTrackUnavailable: true,
      segments: [
        { text: 'a', start: 0, duration: 1 },
        { text: 'b', start: 1, duration: 1 },
      ],
      nativeSegments: [
        { text: '甲', start: 0, duration: 1 },
        { text: '乙', start: 1, duration: 1 },
      ],
    });
    expect(shouldPrewarmMtNativeLine(t)).toBe(true);
  });
});
