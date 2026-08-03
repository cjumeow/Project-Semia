import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { SemiaSettings } from '@semia/shared';
import type { StoredTranscript } from './types';
import {
  coerceTranscriptForNativeLine,
  fetchBilingualTranscript,
  shouldApplyStoredTranscript,
  transcriptMatchesSettings,
} from './bilingualTranscriptFetch';
import * as youtubeTranscript from './youtubeTranscript';

vi.mock('./youtubeTranscript', async (importOriginal) => {
  const actual = await importOriginal<typeof youtubeTranscript>();
  return {
    ...actual,
    fetchTranscriptSegments: vi.fn(),
  };
});

const settings: SemiaSettings = {
  learningLanguage: 'en',
  nativeLanguage: 'zh-TW',
  bilingualCaptionsEnabled: true,
};

const transcript: StoredTranscript = {
  videoId: 'abc',
  videoUrl: 'https://www.youtube.com/watch?v=abc',
  languageCode: 'en',
  nativeLanguageCode: 'zh-TW',
  segments: [{ text: 'hello', start: 0, duration: 1 }],
  nativeSegments: [{ text: '你好', start: 0, duration: 1 }],
  capturedAt: '2026-08-03T00:00:00.000Z',
  source: 'interceptedTimedtextUrl',
};

describe('transcriptMatchesSettings', () => {
  it('accepts transcript that matches current bilingual settings', () => {
    expect(transcriptMatchesSettings(transcript, settings)).toBe(true);
  });

  it('rejects transcript fetched for a different native language', () => {
    const zhCnTranscript: StoredTranscript = {
      ...transcript,
      nativeLanguageCode: 'zh-CN',
    };
    expect(transcriptMatchesSettings(zhCnTranscript, settings)).toBe(false);
  });

  it('accepts nativeTrackUnavailable transcript without native segments', () => {
    const unavailable: StoredTranscript = {
      ...transcript,
      nativeSegments: [],
      nativeTrackUnavailable: true,
    };
    expect(transcriptMatchesSettings(unavailable, settings)).toBe(true);
  });
});

describe('coerceTranscriptForNativeLine', () => {
  it('strips stale native segments when tlang is unavailable', () => {
    const stale: StoredTranscript = {
      ...transcript,
      nativeTrackUnavailable: true,
    };
    const coerced = coerceTranscriptForNativeLine(stale);
    expect(coerced.nativeSegments).toEqual([]);
    expect(coerced.nativeTrackUnavailable).toBe(true);
  });

  it('returns transcript unchanged when tlang is available', () => {
    expect(coerceTranscriptForNativeLine(transcript)).toBe(transcript);
  });
});

describe('fetchBilingualTranscript', () => {
  const fetchSegments = vi.mocked(youtubeTranscript.fetchTranscriptSegments);

  beforeEach(() => {
    fetchSegments.mockReset();
  });

  it('marks nativeTrackUnavailable when tlang fetch returns 429', async () => {
    fetchSegments
      .mockResolvedValueOnce([{ text: 'hello', start: 0, duration: 1 }])
      .mockRejectedValueOnce(new Error('Failed to fetch timedtext: 429 '));

    const result = await fetchBilingualTranscript({
      videoId: 'abc',
      settings,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.translationUnavailable).toBe(true);
    expect(result.transcript.nativeTrackUnavailable).toBe(true);
    expect(result.transcript.nativeSegments).toEqual([]);
  });

  it('clears nativeTrackUnavailable when tlang fetch succeeds', async () => {
    fetchSegments
      .mockResolvedValueOnce([{ text: 'hello', start: 0, duration: 1 }])
      .mockResolvedValueOnce([{ text: '你好', start: 0, duration: 1 }]);

    const result = await fetchBilingualTranscript({
      videoId: 'abc',
      settings,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.transcript.nativeTrackUnavailable).toBeUndefined();
    expect(result.transcript.nativeSegments).toHaveLength(1);
  });
});

describe('shouldApplyStoredTranscript', () => {
  it('allows null transcript updates', () => {
    expect(shouldApplyStoredTranscript(null, settings)).toBe(true);
  });

  it('allows updates when settings are not loaded yet', () => {
    expect(shouldApplyStoredTranscript(transcript, null)).toBe(true);
  });

  it('ignores stale storage when native language changed', () => {
    const stale: StoredTranscript = {
      ...transcript,
      nativeLanguageCode: 'zh-CN',
    };
    expect(shouldApplyStoredTranscript(stale, settings)).toBe(false);
  });
});
