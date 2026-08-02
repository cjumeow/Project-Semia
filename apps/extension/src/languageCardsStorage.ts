import {
  LANGUAGE_CARDS_STORAGE_KEY,
  type LanguageCard,
  type LanguageCardsMap,
} from '@semia/shared';

export async function getLanguageCardsMap(): Promise<LanguageCardsMap> {
  const result = await chrome.storage.local.get(LANGUAGE_CARDS_STORAGE_KEY);
  return (result[LANGUAGE_CARDS_STORAGE_KEY] ?? {}) as LanguageCardsMap;
}

export async function listLanguageCards(): Promise<LanguageCard[]> {
  const cards = await getLanguageCardsMap();
  return Object.values(cards).sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
}

export async function listLanguageCardsForFragment(
  sourceFragmentId: string,
): Promise<LanguageCard[]> {
  const cards = await listLanguageCards();
  return cards.filter((card) => card.sourceFragmentId === sourceFragmentId);
}

export async function saveLanguageCard(card: LanguageCard): Promise<void> {
  const cards = await getLanguageCardsMap();
  cards[card.id] = card;
  await chrome.storage.local.set({
    [LANGUAGE_CARDS_STORAGE_KEY]: cards,
  });
}

export async function deleteLanguageCards(fragmentIds: string[]): Promise<void> {
  if (fragmentIds.length === 0) return;

  const cards = await getLanguageCardsMap();
  const remove = new Set(fragmentIds);
  let changed = false;

  for (const [cardId, card] of Object.entries(cards)) {
    if (remove.has(card.sourceFragmentId)) {
      delete cards[cardId];
      changed = true;
    }
  }

  if (changed) {
    await chrome.storage.local.set({
      [LANGUAGE_CARDS_STORAGE_KEY]: cards,
    });
  }
}
