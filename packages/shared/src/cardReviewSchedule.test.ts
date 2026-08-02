import { describe, expect, it } from 'vitest';
import type { LanguageCard } from './types';
import {
  backfillCardReviewSchedule,
  dueReviewCards,
  enrollCardInReviewQueue,
  isCardDue,
  markCardMastered,
  markCardMasteredFromReview,
  stillLearningCard,
} from './cardReviewSchedule';

function card(overrides: Partial<LanguageCard> = {}): LanguageCard {
  return {
    id: 'card-1',
    sourceFragmentId: 'frag-1',
    focusText: 'tractable',
    intents: ['speaking'],
    focus: 'tractable',
    meaning: '可處理的',
    examples: [],
    createdAt: '2026-08-01T12:00:00.000Z',
    generatedAt: '2026-08-01T12:00:00.000Z',
    ...overrides,
  };
}

describe('enrollCardInReviewQueue', () => {
  it('starts a new card in review with dueAt now', () => {
    const enrolled = enrollCardInReviewQueue(card(), '2026-08-02T10:00:00.000Z');
    expect(enrolled.triageStatus).toBe('review');
    expect(enrolled.reviewStage).toBe(0);
    expect(enrolled.dueAt).toBe('2026-08-02T10:00:00.000Z');
    expect(enrolled.enteredReviewAt).toBe('2026-08-02T10:00:00.000Z');
  });
});

describe('dueReviewCards', () => {
  it('returns only review cards that are due', () => {
    const cards = [
      card({ id: 'due', triageStatus: 'review', dueAt: '2026-08-01T00:00:00.000Z' }),
      card({
        id: 'future',
        triageStatus: 'review',
        dueAt: '2026-08-10T00:00:00.000Z',
      }),
      card({ id: 'mastered', triageStatus: 'mastered' }),
    ];
    const due = dueReviewCards(cards, '2026-08-02T00:00:00.000Z');
    expect(due.map((item) => item.id)).toEqual(['due']);
  });
});

describe('isCardDue', () => {
  it('treats legacy cards without triageStatus as review', () => {
    expect(
      isCardDue(
        card({ dueAt: '2026-08-01T00:00:00.000Z' }),
        '2026-08-02T00:00:00.000Z',
      ),
    ).toBe(true);
  });
});

describe('stillLearningCard', () => {
  it('advances stage and pushes dueAt forward', () => {
    const cards = [
      card({
        triageStatus: 'review',
        reviewStage: 0,
        dueAt: '2026-08-01T00:00:00.000Z',
      }),
    ];
    const [updated] = stillLearningCard(cards, 'card-1', '2026-08-02T10:00:00.000Z');
    expect(updated?.reviewStage).toBe(1);
    expect(updated?.dueAt).toBe('2026-08-03T10:00:00.000Z');
    expect(updated?.lastReviewedAt).toBe('2026-08-02T10:00:00.000Z');
  });
});

describe('markCardMasteredFromReview', () => {
  it('clears schedule and sets mastered', () => {
    const cards = [
      card({
        triageStatus: 'review',
        reviewStage: 2,
        dueAt: '2026-08-01T00:00:00.000Z',
        enteredReviewAt: '2026-08-01T00:00:00.000Z',
      }),
    ];
    const [updated] = markCardMasteredFromReview(
      cards,
      'card-1',
      '2026-08-02T10:00:00.000Z',
    );
    expect(updated?.triageStatus).toBe('mastered');
    expect(updated?.reviewStage).toBeUndefined();
    expect(updated?.dueAt).toBeUndefined();
    expect(updated?.lastReviewedAt).toBe('2026-08-02T10:00:00.000Z');
  });
});

describe('markCardMastered', () => {
  it('can master a card from review queue UI outside session', () => {
    const [updated] = markCardMastered(
      [card({ triageStatus: 'review', dueAt: '2026-08-01T00:00:00.000Z' })],
      'card-1',
      '2026-08-02T10:00:00.000Z',
    );
    expect(updated?.triageStatus).toBe('mastered');
    expect(updated?.dueAt).toBeUndefined();
  });
});

describe('backfillCardReviewSchedule', () => {
  it('anchors dueAt to createdAt for legacy review cards', () => {
    const backfilled = backfillCardReviewSchedule(
      card({ triageStatus: 'review', reviewStage: undefined, dueAt: undefined }),
    );
    expect(backfilled.dueAt).toBe('2026-08-01T12:00:00.000Z');
    expect(backfilled.reviewStage).toBe(0);
  });
});
