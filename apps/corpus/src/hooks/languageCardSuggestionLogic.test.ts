import { describe, expect, it } from 'vitest';
import {
  emptyLanguageCardSuggestionFields,
  focusBaseFormSuggestion,
} from './languageCardSuggestionLogic';

describe('languageCardSuggestionLogic', () => {
  it('returns base form only when it differs from focus text', () => {
    expect(focusBaseFormSuggestion('run', 'ran')).toBe('run');
    expect(focusBaseFormSuggestion('run', 'run')).toBeNull();
    expect(focusBaseFormSuggestion(null, 'ran')).toBeNull();
  });

  it('requests only empty enabled fields', () => {
    expect(
      emptyLanguageCardSuggestionFields({
        meaningEmpty: true,
        exampleEnabled: true,
        exampleEmpty: false,
      }),
    ).toEqual(['meaning']);

    expect(
      emptyLanguageCardSuggestionFields({
        meaningEmpty: false,
        exampleEnabled: false,
        exampleEmpty: true,
      }),
    ).toEqual([]);
  });
});
