import { describe, expect, it } from 'vitest';
import { parseFocusKeywordSuggestions } from './focusKeywordSuggestion';

const SPEECH =
  'When people say "context" in English, they usually mean the surrounding situation. You have to be careful with that word when writing formal emails.';

describe('parseFocusKeywordSuggestions', () => {
  it('parses valid JSON and filters non-verbatim candidates', () => {
    const result = parseFocusKeywordSuggestions(
      JSON.stringify({
        candidates: [
          { text: 'careful with', kind: 'collocation' },
          { text: 'not in speech', kind: 'word' },
          { text: 'formal emails', kind: 'phrase' },
          { text: 'extra', kind: 'word' },
        ],
      }),
      SPEECH,
    );

    expect(result.candidates).toEqual([
      { text: 'careful with', kind: 'collocation' },
      { text: 'formal emails', kind: 'phrase' },
    ]);
  });

  it('caps at three candidates', () => {
    const result = parseFocusKeywordSuggestions(
      JSON.stringify({
        candidates: [
          { text: 'context', kind: 'word' },
          { text: 'surrounding situation', kind: 'phrase' },
          { text: 'careful with', kind: 'collocation' },
          { text: 'formal emails', kind: 'phrase' },
        ],
      }),
      SPEECH,
    );

    expect(result.candidates).toHaveLength(3);
  });

  it('returns empty when JSON is missing', () => {
    expect(parseFocusKeywordSuggestions('not json', SPEECH)).toEqual({
      candidates: [],
    });
  });
});
