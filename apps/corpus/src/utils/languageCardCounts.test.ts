import { describe, expect, it } from 'vitest';
import type { LanguageCard } from '@semia/shared';
import { cardCountByFragmentId } from './languageCardCounts';

const card = (id: string, fragmentId: string): LanguageCard => ({
  id,
  sourceFragmentId: fragmentId,
  focusText: 'focus',
  intents: ['speaking'],
  focus: 'focus',
  meaning: 'meaning',
  scenario1: 's1',
  scenario2: 's2',
  createdAt: '2026-08-02T00:00:00.000Z',
  generatedAt: '2026-08-02T00:00:00.000Z',
});

describe('cardCountByFragmentId', () => {
  it('counts multiple cards per fragment', () => {
    const counts = cardCountByFragmentId([
      card('c1', 's1'),
      card('c2', 's1'),
      card('c3', 's2'),
    ]);

    expect(counts.get('s1')).toBe(2);
    expect(counts.get('s2')).toBe(1);
  });

  it('returns empty map for no cards', () => {
    expect(cardCountByFragmentId([]).size).toBe(0);
  });
});
