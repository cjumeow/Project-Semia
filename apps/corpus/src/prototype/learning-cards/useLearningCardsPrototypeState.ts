import { useMemo, useState } from 'react';
import {
  describeLearningCardsState,
  MOCK_LEARNING_CARDS,
} from './mockLearningCards';
import type { LanguageCard } from '@semia/shared';

function matchesSearch(card: LanguageCard, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    card.focus.toLowerCase().includes(q) ||
    card.meaning.toLowerCase().includes(q)
  );
}

export function useLearningCardsPrototypeState(variant: string) {
  const [cards] = useState(MOCK_LEARNING_CARDS);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const visibleCards = useMemo(() => {
    return cards
      .filter((card) => matchesSearch(card, search))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [cards, search]);

  const selectedCard = useMemo(
    () => cards.find((card) => card.id === selectedId) ?? null,
    [cards, selectedId],
  );

  return {
    cards,
    visibleCards,
    search,
    setSearch,
    selectedCard,
    selectCard: setSelectedId,
    closeCard: () => setSelectedId(null),
    stateSummary: describeLearningCardsState({
      total: cards.length,
      visible: visibleCards.length,
      search,
      selectedId,
      variant,
    }),
  };
}

export type LearningCardsPrototypeState = ReturnType<
  typeof useLearningCardsPrototypeState
>;
