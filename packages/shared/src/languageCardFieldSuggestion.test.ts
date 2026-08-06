import { describe, expect, it } from 'vitest';
import { parseLanguageCardFieldSuggestions } from './languageCardFieldSuggestion';

describe('parseLanguageCardFieldSuggestions', () => {
  it('parses meaning and example blocks', () => {
    expect(
      parseLanguageCardFieldSuggestions(
        'MEANING: 船隻\nEXAMPLE: The fleet includes several naval vessels.',
        ['meaning', 'example'],
      ),
    ).toEqual({
      meaning: '船隻',
      example: 'The fleet includes several naval vessels.',
    });
  });

  it('returns only requested fields', () => {
    expect(
      parseLanguageCardFieldSuggestions('MEANING: 船隻\nEXAMPLE: Sample', [
        'meaning',
      ]),
    ).toEqual({ meaning: '船隻' });
  });
});
