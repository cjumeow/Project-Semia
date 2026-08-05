import { describe, expect, it } from 'vitest';
import type { LanguageFragment } from '@semia/shared';
import { buildSnippetChatSystemPrompt } from './buildSnippetChatPrompt';

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

describe('buildSnippetChatSystemPrompt', () => {
  it('returns general tutor prompt without a fragment', () => {
    const prompt = buildSnippetChatSystemPrompt({ nativeLanguage: 'zh-TW' });
    expect(prompt).toContain('not discussing a specific capture');
    expect(prompt).not.toContain('SNIP NOTE');
  });

  it('includes snippet context and note when fragment is provided', () => {
    const prompt = buildSnippetChatSystemPrompt({
      fragment,
      note: {
        originalSpeech: 'naval vessels',
        naturalTranslation: '海軍船艦',
        dynamicContextBlock: '',
        backgroundNote: 'Historical context.',
        generatedAt: '2026-08-05T10:00:00.000Z',
      },
      nativeLanguage: 'zh-TW',
    });

    expect(prompt).toContain('naval vessels');
    expect(prompt).toContain('[SNIP NOTE]');
    expect(prompt).toContain('Historical context.');
    expect(prompt).toContain('Traditional Chinese');
  });
});
