import type { LanguageCard } from '@semia/shared';

export function cardCountByFragmentId(
  cards: LanguageCard[],
): Map<string, number> {
  const counts = new Map<string, number>();

  for (const card of cards) {
    counts.set(
      card.sourceFragmentId,
      (counts.get(card.sourceFragmentId) ?? 0) + 1,
    );
  }

  return counts;
}
