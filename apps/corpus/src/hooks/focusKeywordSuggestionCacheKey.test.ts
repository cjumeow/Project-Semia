import { describe, expect, it } from 'vitest';
import { focusKeywordSuggestionCacheKey } from './focusKeywordSuggestionCacheKey';

describe('focusKeywordSuggestionCacheKey', () => {
  it('is stable for the same capture', () => {
    expect(
      focusKeywordSuggestionCacheKey('frag-1', '2026-01-01T00:00:00.000Z'),
    ).toBe('v5:frag-1:2026-01-01T00:00:00.000Z');
  });

  it('changes when note timestamp changes', () => {
    const first = focusKeywordSuggestionCacheKey(
      'frag-1',
      '2026-01-01T00:00:00.000Z',
    );
    const second = focusKeywordSuggestionCacheKey(
      'frag-1',
      '2026-01-02T00:00:00.000Z',
    );
    expect(first).not.toBe(second);
  });
});
