import { describe, expect, it } from 'vitest';
import { parseLanguageCardFieldSuggestions } from './languageCardFieldSuggestion';

describe('parseLanguageCardFieldSuggestions', () => {
  it('parses multiline bilingual example markdown', () => {
    expect(
      parseLanguageCardFieldSuggestions(
        `MEANING: 船隻
EXAMPLE:
- The primitive tools were made of stone and wood.
  原始工具由石頭和木頭製成。`,
        ['meaning', 'example'],
      ),
    ).toEqual({
      meaning: '船隻',
      example:
        '- The primitive tools were made of stone and wood.\n  原始工具由石頭和木頭製成。',
    });
  });

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
