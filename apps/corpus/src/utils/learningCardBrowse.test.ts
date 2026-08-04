import { describe, expect, it } from 'vitest';
import type { LanguageCard } from '@semia/shared';
import { browseLearningCards } from './learningCardBrowse';

function card(
  id: string,
  overrides: Partial<LanguageCard> = {},
): LanguageCard {
  return {
    id,
    sourceFragmentId: 'frag-1',
    focusText: 'v.',
    intents: ['speaking'],
    focus: 'alpha',
    meaning: '阿爾法',
    examples: [],
    createdAt: '2026-08-01T00:00:00.000Z',
    generatedAt: '2026-08-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('browseLearningCards', () => {
  it('sorts by createdAt newest first', () => {
    const result = browseLearningCards(
      [
        card('old', {
          focus: 'old',
          createdAt: '2026-08-01T00:00:00.000Z',
        }),
        card('new', {
          focus: 'new',
          createdAt: '2026-08-04T00:00:00.000Z',
        }),
      ],
      '',
    );

    expect(result.map((item) => item.id)).toEqual(['new', 'old']);
  });

  it('filters by focus and meaning case-insensitively', () => {
    const cards = [
      card('1', { focus: 'Grill', meaning: '嚴厲盤問' }),
      card('2', { focus: 'capture', meaning: '擷取' }),
    ];

    expect(browseLearningCards(cards, 'grill').map((item) => item.id)).toEqual([
      '1',
    ]);
    expect(browseLearningCards(cards, '擷取').map((item) => item.id)).toEqual([
      '2',
    ]);
  });

  it('returns all cards when search is blank', () => {
    const cards = [card('1'), card('2')];
    expect(browseLearningCards(cards, '   ')).toHaveLength(2);
  });
});
