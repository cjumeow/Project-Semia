import { describe, expect, it } from 'vitest';
import {
  mergeSubtitleSettingsPatch,
  normalizeLearningLanguage,
  normalizeNativeLanguage,
} from './subtitleSettingsPatch';

describe('normalizeLearningLanguage', () => {
  it('keeps supported learning codes', () => {
    expect(normalizeLearningLanguage('ja')).toBe('ja');
  });

  it('falls back to en for unknown codes', () => {
    expect(normalizeLearningLanguage('xx')).toBe('en');
  });
});

describe('normalizeNativeLanguage', () => {
  it('keeps supported native codes', () => {
    expect(normalizeNativeLanguage('zh-CN')).toBe('zh-CN');
  });

  it('falls back to zh-TW for unknown codes', () => {
    expect(normalizeNativeLanguage('xx')).toBe('zh-TW');
  });
});

describe('mergeSubtitleSettingsPatch', () => {
  it('merges subtitle fields without dropping unrelated settings', () => {
    const next = mergeSubtitleSettingsPatch(
      {
        aiProvider: 'openai',
        aiApiKey: 'secret',
        learningLanguage: 'en',
        nativeLanguage: 'zh-TW',
        bilingualCaptionsEnabled: true,
      },
      {
        learningLanguage: 'ja',
        bilingualCaptionsEnabled: false,
      },
    );

    expect(next.aiProvider).toBe('openai');
    expect(next.aiApiKey).toBe('secret');
    expect(next.learningLanguage).toBe('ja');
    expect(next.nativeLanguage).toBe('zh-TW');
    expect(next.bilingualCaptionsEnabled).toBe(false);
  });

  it('rejects invalid language codes in patch', () => {
    const next = mergeSubtitleSettingsPatch(
      { learningLanguage: 'en', nativeLanguage: 'zh-TW' },
      { learningLanguage: 'bogus', nativeLanguage: 'also-bogus' },
    );

    expect(next.learningLanguage).toBe('en');
    expect(next.nativeLanguage).toBe('zh-TW');
  });
});
