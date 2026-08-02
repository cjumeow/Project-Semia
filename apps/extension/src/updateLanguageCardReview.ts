import {
  markCardMastered,
  markCardMasteredFromReview,
  stillLearningCard,
} from '@semia/shared';
import { updateLanguageCards } from './languageCardsStorage';

export async function recordCardStillLearning(cardId: string): Promise<void> {
  const now = new Date().toISOString();
  await updateLanguageCards((cards) => stillLearningCard(cards, cardId, now));
}

export async function setCardTriageStatus(
  cardId: string,
  status: 'mastered',
): Promise<void> {
  const now = new Date().toISOString();
  await updateLanguageCards((cards) =>
    status === 'mastered' ? markCardMastered(cards, cardId, now) : cards,
  );
}

export async function markCardMasteredInReview(cardId: string): Promise<void> {
  const now = new Date().toISOString();
  await updateLanguageCards((cards) =>
    markCardMasteredFromReview(cards, cardId, now),
  );
}
