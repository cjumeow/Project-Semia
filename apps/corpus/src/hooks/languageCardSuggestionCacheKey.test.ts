import { describe, expect, it } from 'vitest';
import { languageCardSuggestionCacheKey } from './languageCardSuggestionCacheKey';

describe('languageCardSuggestionCacheKey', () => {
  it('includes snippet, note version, focus text, and empty fields', () => {
    expect(
      languageCardSuggestionCacheKey(
        'frag-1',
        '2026-01-01T00:00:00.000Z',
        'Ran',
        ['meaning', 'example'],
      ),
    ).toBe('v2:frag-1:2026-01-01T00:00:00.000Z:ran:example,meaning');
  });

  it('returns null without snippet or note timestamp', () => {
    expect(
      languageCardSuggestionCacheKey(undefined, '2026-01-01T00:00:00.000Z', 'run', []),
    ).toBeNull();
    expect(languageCardSuggestionCacheKey('frag-1', undefined, 'run', [])).toBeNull();
  });

  it('returns null for blank focus text', () => {
    expect(
      languageCardSuggestionCacheKey('frag-1', '2026-01-01T00:00:00.000Z', '  ', []),
    ).toBeNull();
  });
});
