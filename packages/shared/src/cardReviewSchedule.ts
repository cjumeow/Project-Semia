import type { LanguageCard, ReviewStage, SnippetTriageStatus } from './types';
import {
  addDays,
  intervalDaysAfterStillLearning,
  nextReviewStage,
} from './reviewSchedule';

export function effectiveCardTriageStatus(
  card: LanguageCard,
): Exclude<SnippetTriageStatus, 'pending'> {
  return card.triageStatus ?? 'review';
}

export function isCardDue(card: LanguageCard, now: string): boolean {
  return (
    effectiveCardTriageStatus(card) === 'review' &&
    card.dueAt !== undefined &&
    card.dueAt <= now
  );
}

export function dueReviewCards(
  cards: LanguageCard[],
  now: string,
): LanguageCard[] {
  return cards
    .filter((card) => isCardDue(card, now))
    .sort((a, b) => (a.dueAt ?? '').localeCompare(b.dueAt ?? ''));
}

export function enrollCardInReviewQueue(
  card: LanguageCard,
  now: string,
): LanguageCard {
  return {
    ...card,
    triageStatus: 'review',
    enteredReviewAt: now,
    reviewStage: 0,
    dueAt: now,
    lastReviewedAt: undefined,
  };
}

export function stillLearningCard(
  cards: LanguageCard[],
  cardId: string,
  now: string,
): LanguageCard[] {
  return cards.map((card) => {
    if (card.id !== cardId || effectiveCardTriageStatus(card) !== 'review') {
      return card;
    }
    const stage = card.reviewStage ?? 0;
    const nextStage = nextReviewStage(stage);
    const days = intervalDaysAfterStillLearning(stage);
    return {
      ...card,
      reviewStage: nextStage,
      dueAt: addDays(now, days),
      lastReviewedAt: now,
    };
  });
}

export function markCardMasteredFromReview(
  cards: LanguageCard[],
  cardId: string,
  now: string,
): LanguageCard[] {
  return cards.map((card) => {
    if (card.id !== cardId || effectiveCardTriageStatus(card) !== 'review') {
      return card;
    }
    return clearCardReviewSchedule({
      ...card,
      triageStatus: 'mastered',
      lastReviewedAt: now,
    });
  });
}

export function markCardMastered(
  cards: LanguageCard[],
  cardId: string,
  now: string,
): LanguageCard[] {
  return cards.map((card) => {
    if (card.id !== cardId) {
      return card;
    }
    if (effectiveCardTriageStatus(card) === 'review') {
      return clearCardReviewSchedule({
        ...card,
        triageStatus: 'mastered',
        lastReviewedAt: now,
      });
    }
    return clearCardReviewSchedule({
      ...card,
      triageStatus: 'mastered',
    });
  });
}

/** Backfill legacy cards that predate review schedule fields. */
export function backfillCardReviewSchedule(card: LanguageCard): LanguageCard {
  if (effectiveCardTriageStatus(card) !== 'review') {
    return card;
  }
  if (card.dueAt !== undefined) {
    return card;
  }
  return {
    ...card,
    reviewStage: (card.reviewStage ?? 0) as ReviewStage,
    dueAt: card.createdAt,
  };
}

export function clearCardReviewSchedule(card: LanguageCard): LanguageCard {
  return {
    ...card,
    enteredReviewAt: undefined,
    reviewStage: undefined,
    dueAt: undefined,
  };
}
