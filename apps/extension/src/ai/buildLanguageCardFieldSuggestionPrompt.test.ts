import { describe, expect, it } from 'vitest';
import type { LanguageFragment } from '@semia/shared';
import { buildLanguageCardFieldSuggestionPrompt } from './buildLanguageCardFieldSuggestionPrompt';

const fragment: LanguageFragment = {
  id: 'frag-1',
  selectedText: 'naval vessels',
  contextText: 'naval vessels in the Navy',
  languageCode: 'en',
  sourceUrl: 'https://example.com',
  sourceTitle: 'Demo',
  capturedAt: '2026-08-05T10:00:00.000Z',
  triageStatus: 'review',
  anchor: {
    kind: 'web',
    textQuote: { exact: 'naval vessels' },
    textPosition: { start: 0, end: 13 },
    locateQuality: 'precise',
  },
};

describe('buildLanguageCardFieldSuggestionPrompt', () => {
  it('writes meaning in native language and example in capture language', () => {
    const { system } = buildLanguageCardFieldSuggestionPrompt({
      fragment,
      focusText: 'naval vessels',
      fields: ['meaning', 'example'],
      nativeLanguage: 'zh-TW',
      originalSpeech: 'naval vessels',
      naturalTranslation: '海軍船艦',
    });

    expect(system).toContain('MEANING must be a short explanation in Traditional Chinese');
    expect(system).toContain('EXAMPLE must be one natural sentence in en');
    expect(system).not.toMatch(/Write in Traditional Chinese\./);
  });

  it('requests only example language rule when meaning is omitted', () => {
    const { system } = buildLanguageCardFieldSuggestionPrompt({
      fragment,
      focusText: 'vessels',
      fields: ['example'],
      nativeLanguage: 'zh-TW',
      originalSpeech: 'naval vessels',
      naturalTranslation: '海軍船艦',
    });

    expect(system).not.toContain('MEANING must');
    expect(system).toContain('EXAMPLE must be one natural sentence in en');
  });
});
