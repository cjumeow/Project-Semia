import type { LanguageCard, LanguageCardDraftContent } from '@semia/shared';
import {
  applyEditorContentToLanguageCard,
  normalizeLanguageCard,
} from '@semia/shared';
import { updateLanguageCards } from './languageCardsStorage';

export async function updateLanguageCardContent(
  cardId: string,
  content: LanguageCardDraftContent,
): Promise<LanguageCard> {
  const focusText = content.focusText.trim();
  const meaning = content.meaning.trim();
  if (!focusText) {
    throw new Error('Focus text is required.');
  }
  if (!meaning) {
    throw new Error('Meaning is required.');
  }

  let updatedCard: LanguageCard | undefined;

  await updateLanguageCards((cards) =>
    cards.map((card) => {
      if (card.id !== cardId) {
        return card;
      }

      updatedCard = applyEditorContentToLanguageCard(
        normalizeLanguageCard(card),
        content,
      );
      return updatedCard;
    }),
  );

  if (!updatedCard) {
    throw new Error('Language card not found.');
  }

  return updatedCard;
}
