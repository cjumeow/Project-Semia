import { describe, expect, it } from 'vitest';
import {
  emptyLanguageCardSuggestionFields,
  focusAppearsInSpeech,
  focusBaseFormSuggestion,
  shouldRequestLanguageCardFieldSuggestions,
} from './languageCardSuggestionLogic';

describe('languageCardSuggestionLogic', () => {
  it('matches focus text verbatim in original speech', () => {
    expect(focusAppearsInSpeech('coursework', 'Her coursework was due.')).toBe(
      true,
    );
    expect(focusAppearsInSpeech('Coursework', 'her coursework was due')).toBe(
      true,
    );
    expect(focusAppearsInSpeech('tested', 'Her coursework was due.')).toBe(
      false,
    );
  });

  it('requests field suggestions only when focus appears in speech', () => {
    expect(
      shouldRequestLanguageCardFieldSuggestions({
        focusInSpeech: true,
        emptyFields: ['meaning'],
      }),
    ).toBe(true);
    expect(
      shouldRequestLanguageCardFieldSuggestions({
        focusInSpeech: false,
        emptyFields: ['meaning', 'example'],
      }),
    ).toBe(false);
  });

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
