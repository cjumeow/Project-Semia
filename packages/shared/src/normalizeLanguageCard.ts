import type { CardIntent, LanguageCard, LanguageCardExample } from './types';

type LegacyLanguageCard = LanguageCard & {
  scenario1?: string;
  scenario2?: string;
  speakingExample?: string;
  writingExample?: string;
};

function migrateExamples(card: LegacyLanguageCard): LanguageCardExample[] {
  if (card.examples?.length) {
    return card.examples;
  }

  const examples: LanguageCardExample[] = [];

  if (card.speakingExample?.trim()) {
    examples.push({
      kind: 'speaking',
      text: card.speakingExample.trim(),
      translation: '',
    });
  }

  if (card.writingExample?.trim()) {
    examples.push({
      kind: 'writing',
      text: card.writingExample.trim(),
      translation: '',
    });
  }

  return examples;
}

function migrateScenario(card: LegacyLanguageCard): string | undefined {
  if (card.scenario?.trim()) {
    return card.scenario.trim();
  }

  const parts = [card.scenario1, card.scenario2]
    .map((part) => part?.trim())
    .filter(Boolean) as string[];

  if (parts.length === 0) {
    return undefined;
  }

  return parts.join('\n\n');
}

/** Normalize persisted cards (including pre-v2 shape) for UI and prompts. */
export function normalizeLanguageCard(card: LegacyLanguageCard): LanguageCard {
  const {
    scenario1: _scenario1,
    scenario2: _scenario2,
    speakingExample: _speakingExample,
    writingExample: _writingExample,
    ...rest
  } = card;

  return {
    ...rest,
    focus: rest.focus,
    meaning: rest.meaning,
    scenario: migrateScenario(card),
    examples: migrateExamples(card),
    intents: rest.intents.filter(
      (intent): intent is CardIntent =>
        intent === 'speaking' || intent === 'writing',
    ),
  };
}
