import { describe, expect, it } from 'vitest';
import type { SemiaSettings } from '@semia/shared';
import type { StoredTranscript } from './types';
import {
  shouldApplyStoredTranscript,
  transcriptMatchesSettings,
} from './bilingualTranscriptFetch';

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
