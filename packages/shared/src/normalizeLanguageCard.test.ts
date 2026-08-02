import { describe, expect, it } from 'vitest';
import { normalizeLanguageCard } from './normalizeLanguageCard';
import type { LanguageCard } from './types';

const base = {
  id: 'c1',
  sourceFragmentId: 's1',
  focusText: 'focus',
  intents: ['speaking'] as const,
  focus: 'focus',
  meaning: '意思',
  createdAt: '2026-01-01T00:00:00.000Z',
  generatedAt: '2026-01-01T00:00:00.000Z',
};

describe('normalizeLanguageCard', () => {
  it('migrates legacy scenario and example fields', () => {
    const legacy = {
      ...base,
      scenario1: 'Scenario 1 — one',
      scenario2: 'Scenario 2 — two',
      speakingExample: 'Say this.',
      examples: undefined,
    } as LanguageCard & {
      scenario1: string;
      scenario2: string;
      speakingExample: string;
    };

    const normalized = normalizeLanguageCard(legacy);

    expect(normalized.scenario).toContain('Scenario 1');
    expect(normalized.scenario).toContain('Scenario 2');
    expect(normalized.examples).toEqual([
      { kind: 'speaking', text: 'Say this.', translation: '' },
    ]);
  });

  it('keeps v2 cards unchanged', () => {
    const card: LanguageCard = {
      ...base,
      intents: ['writing'],
      scenario: '使用時機',
      examples: [
        { kind: 'writing', text: 'Example', translation: '例句' },
      ],
    };

    expect(normalizeLanguageCard(card)).toEqual(card);
  });
});
