import { describe, expect, it } from 'vitest';
import { shouldPrewarmMtNativeLine } from './mtNativePrewarm';
import type { StoredTranscript } from './types';

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
