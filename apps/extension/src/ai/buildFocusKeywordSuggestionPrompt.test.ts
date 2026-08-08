import { describe, expect, it } from 'vitest';
import type { LanguageFragment } from '@semia/shared';
import { buildFocusKeywordSuggestionPrompt } from './buildFocusKeywordSuggestionPrompt';

const FRAGMENT: LanguageFragment = {
  id: 'frag-1',
  selectedText: 'context',
  sourceTitle: 'Example',
  sourceUrl: 'https://example.com',
  languageCode: 'en',
  capturedAt: '2026-01-01T00:00:00.000Z',
  triageStatus: 'review',
  anchor: {
    kind: 'web',
    textQuote: { exact: 'context' },
    textPosition: { start: 0, end: 7 },
    locateQuality: 'precise',
  },
  contextText: 'sample',
};

describe('buildFocusKeywordSuggestionPrompt', () => {
  it('includes daily mode and original speech only', () => {
    const { system, user } = buildFocusKeywordSuggestionPrompt({
      fragment: FRAGMENT,
      originalSpeech: 'Be careful with formal emails.',
      userLevelMode: 'daily',
    });

    expect(system).toContain('User level mode: Daily');
    expect(system).toContain('Original speech');
    expect(system).not.toContain('context window');
    expect(user).toBe('Original speech:\nBe careful with formal emails.');
  });

  it('includes advanced fallback rule', () => {
    const { system } = buildFocusKeywordSuggestionPrompt({
      fragment: FRAGMENT,
      originalSpeech: 'Be careful with formal emails.',
      userLevelMode: 'advanced',
    });

    expect(system).toContain('User level mode: Advanced');
    expect(system).toContain('still return 1 candidate');
  });
});
