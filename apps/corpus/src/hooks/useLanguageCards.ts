import type { LanguageCard } from '@semia/shared';
import { useCallback, useEffect, useState } from 'react';
import { corpusRepository } from '../data/corpusRepository';

export function useLanguageCards(): {
  cards: LanguageCard[];
  loading: boolean;
  refresh: () => Promise<void>;
  countForFragment: (fragmentId: string) => number;
} {
  const [cards, setCards] = useState<LanguageCard[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (): Promise<void> => {
    if (!corpusRepository.isLive()) {
      setCards([]);
      setLoading(false);
      return;
    }

    try {
      setCards(await corpusRepository.getLanguageCards());
    } catch {
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const countForFragment = useCallback(
    (fragmentId: string): number =>
      cards.filter((card) => card.sourceFragmentId === fragmentId).length,
    [cards],
  );

  return { cards, loading, refresh, countForFragment };
}
