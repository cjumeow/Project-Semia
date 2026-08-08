import { describe, expect, it } from 'vitest';
import {
  baseFormSuggestionCacheKey,
  focusAppearsInSpeech,
  focusBaseFormSuggestion,
} from './baseFormSuggestionLogic';

describe('focusAppearsInSpeech', () => {
  it('matches focus text case-insensitively within speech', () => {
    expect(focusAppearsInSpeech('Running', 'She was running fast.')).toBe(true);
    expect(focusAppearsInSpeech('missing', 'She was running fast.')).toBe(false);
  });
});

describe('focusBaseFormSuggestion', () => {
  it('returns null when base form matches focus text', () => {
    expect(focusBaseFormSuggestion('run', 'run')).toBeNull();
    expect(focusBaseFormSuggestion('Run', 'run')).toBeNull();
  });

  it('returns trimmed base form when different from focus text', () => {
    expect(focusBaseFormSuggestion('  run  ', 'running')).toBe('run');
  });
});

describe('baseFormSuggestionCacheKey', () => {
  it('returns null when required inputs are missing', () => {
    expect(baseFormSuggestionCacheKey(undefined, 'note', 'run')).toBeNull();
    expect(baseFormSuggestionCacheKey('id', undefined, 'run')).toBeNull();
    expect(baseFormSuggestionCacheKey('id', 'note', '  ')).toBeNull();
  });

  it('builds a stable cache key', () => {
    expect(baseFormSuggestionCacheKey('frag-1', '2026-01-01', 'running')).toBe(
      'frag-1:2026-01-01:running',
    );
  });
});
