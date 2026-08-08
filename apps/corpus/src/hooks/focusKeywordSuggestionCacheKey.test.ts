import { describe, expect, it } from 'vitest';
import { focusKeywordSuggestionCacheKey } from './focusKeywordSuggestionCacheKey';

describe('focusKeywordSuggestionCacheKey', () => {
  it('is stable for the same capture and mode', () => {
    expect(
      focusKeywordSuggestionCacheKey('frag-1', 'daily', '2026-01-01T00:00:00.000Z'),
    ).toBe('v3:frag-1:daily:2026-01-01T00:00:00.000Z');
  });

  it('changes when mode changes', () => {
    const daily = focusKeywordSuggestionCacheKey(
      'frag-1',
      'daily',
      '2026-01-01T00:00:00.000Z',
    );
    const advanced = focusKeywordSuggestionCacheKey(
      'frag-1',
      'advanced',
      '2026-01-01T00:00:00.000Z',
    );
    expect(daily).not.toBe(advanced);
  });
});
