import { describe, expect, it } from 'vitest';
import type { LanguageFragment } from '@semia/shared';
import { buildBaseFormSuggestionPrompt } from './buildBaseFormSuggestionPrompt';

const fragment: LanguageFragment = {
  id: 'frag-1',
  selectedText: 'ran',
  contextText: 'She ran quickly.',
  languageCode: 'en',
  sourceUrl: 'https://example.com',
  sourceTitle: 'Demo',
  capturedAt: '2026-08-05T10:00:00.000Z',
  triageStatus: 'review',
  anchor: {
    kind: 'web',
    textQuote: { exact: 'ran' },
    textPosition: { start: 0, end: 3 },
    locateQuality: 'precise',
  },
};

const longSpeech =
  'Alpha sentence one. Beta sentence two. She ran quickly to the store. Gamma sentence four. Delta sentence five.';

describe('buildBaseFormSuggestionPrompt', () => {
  it('uses suggestion excerpt instead of full original speech', () => {
    const excerpt = 'Beta sentence two. She ran quickly to the store. Gamma sentence four.';
    const { user, system } = buildBaseFormSuggestionPrompt({
      fragment,
      focusText: 'ran',
      suggestionExcerpt: excerpt,
    });

    expect(user).toContain(`Suggestion excerpt: ${excerpt}`);
    expect(user).toContain('Focus phrase: ran');
    expect(user).not.toContain(longSpeech);
    expect(user).not.toContain('Natural translation');
    expect(user).not.toContain('Context window');
    expect(system).toContain('languageCode: en');
    expect(system).toContain('BASE_FORM:');
  });

  it('mentions global dictionary-form rules and null for non-inflecting languages', () => {
    const { system } = buildBaseFormSuggestionPrompt({
      fragment: { ...fragment, languageCode: 'zh' },
      focusText: '學習',
      suggestionExcerpt: '我們一起學習中文。',
    });

    expect(system).toMatch(/Japanese|Korean|English/i);
    expect(system).toMatch(/null/i);
    expect(system).toMatch(/Chinese|zh/i);
  });
});
