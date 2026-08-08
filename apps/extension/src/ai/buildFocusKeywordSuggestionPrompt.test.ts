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
  it('includes global semantic filter, languages, and original speech user block', () => {
    const { system, user } = buildFocusKeywordSuggestionPrompt({
      fragment: FRAGMENT,
      originalSpeech: 'Be careful with formal emails.',
      userLevelMode: 'daily',
      nativeLanguage: 'zh-TW',
    });

    expect(system).toContain('expert language acquisition assistant');
    expect(system).toContain('The source language of [Original Speech] is: en');
    expect(system).toContain(
      "The user's native (target) language is: Traditional Chinese",
    );
    expect(system).toContain('8-Year-Old Native Speaker Rule');
    expect(system).toContain('No Overlapping/Redundant Subsets');
    expect(system).toContain('swing most between');
    expect(system).not.toContain('context window');
    expect(user).toBe(
      '[Original Speech]\nBe careful with formal emails.',
    );
  });

  it('includes advanced mode fallback in system prompt', () => {
    const { system } = buildFocusKeywordSuggestionPrompt({
      fragment: FRAGMENT,
      originalSpeech: 'Be careful with formal emails.',
      userLevelMode: 'advanced',
      nativeLanguage: 'zh-TW',
    });

    expect(system).toContain("user's level mode (advanced)");
    expect(system).toContain('you MUST still find exactly 1 best candidate');
  });
});
