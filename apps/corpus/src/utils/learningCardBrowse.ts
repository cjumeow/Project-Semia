import type { LanguageCard } from '@semia/shared';

export function matchesLearningCardSearch(
  card: LanguageCard,
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    card.focus.toLowerCase().includes(q) ||
    card.meaning.toLowerCase().includes(q)
  );
}

export function sortLearningCardsByCreatedAt(
  cards: LanguageCard[],
): LanguageCard[] {
  return [...cards].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function browseLearningCards(
  cards: LanguageCard[],
  query: string,
): LanguageCard[] {
  return sortLearningCardsByCreatedAt(cards).filter((card) =>
    matchesLearningCardSearch(card, query),
  );
}
