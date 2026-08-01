import { describe, expect, it } from 'vitest';
import type { LanguageFragment, ReviewStage } from './types';
import {
  addDays,
  applySnippetTriageStatus,
  backfillReviewSchedule,
  dueReviewFragments,
  enterReviewQueue,
  intervalDaysAfterStillLearning,
  isDue,
  markMasteredFromReview,
  nextReviewStage,
  stillLearning,
} from './reviewSchedule';

const webAnchor = {
  kind: 'web' as const,
  textQuote: { exact: 'word' },
  textPosition: { start: 0, end: 4 },
  locateQuality: 'precise' as const,
};

function fragment(
  id: string,
  overrides: Partial<LanguageFragment> = {},
): LanguageFragment {
  return {
    id,
    selectedText: id,
    contextText: 'context',
    languageCode: 'en',
    sourceUrl: 'https://example.com',
    sourceTitle: 'Example',
    capturedAt: '2026-08-01T12:00:00.000Z',
    triageStatus: 'pending',
    anchor: webAnchor,
    ...overrides,
  };
}

describe('intervalDaysAfterStillLearning', () => {
  it.each<[ReviewStage, number]>([
    [0, 1],
    [1, 3],
    [2, 14],
    [3, 30],
    [4, 30],
  ])('stage %i schedules %i days', (stage, days) => {
    expect(intervalDaysAfterStillLearning(stage)).toBe(days);
  });
});

describe('nextReviewStage', () => {
  it('advances until stage 4', () => {
    expect(nextReviewStage(0)).toBe(1);
    expect(nextReviewStage(3)).toBe(4);
    expect(nextReviewStage(4)).toBe(4);
  });
});

describe('enterReviewQueue', () => {
  it('moves pending fragment to immediate review', () => {
    const now = '2026-08-06T12:00:00.000Z';
    const [next] = enterReviewQueue([fragment('a')], 'a', now);

    expect(next).toMatchObject({
      triageStatus: 'review',
      reviewStage: 0,
      dueAt: now,
      enteredReviewAt: now,
    });
    expect(next?.lastReviewedAt).toBeUndefined();
  });

  it('ignores non-pending fragments', () => {
    const now = '2026-08-06T12:00:00.000Z';
    const input = [fragment('a', { triageStatus: 'mastered' })];
    expect(enterReviewQueue(input, 'a', now)).toEqual(input);
  });
});

describe('stillLearning', () => {
  it('advances stage and schedules from review moment', () => {
    const dueAt = '2026-08-03T12:00:00.000Z';
    const now = '2026-08-06T12:00:00.000Z';
    const input = [
      fragment('a', {
        triageStatus: 'review',
        reviewStage: 2,
        dueAt,
        enteredReviewAt: '2026-08-01T12:00:00.000Z',
      }),
    ];

    const [next] = stillLearning(input, 'a', now);

    expect(next).toMatchObject({
      triageStatus: 'review',
      reviewStage: 3,
      dueAt: addDays(now, 14),
      lastReviewedAt: now,
    });
  });

  it('keeps stage 4 on repeated still learning', () => {
    const now = '2026-08-06T12:00:00.000Z';
    const input = [
      fragment('a', {
        triageStatus: 'review',
        reviewStage: 4,
        dueAt: now,
      }),
    ];

    const [next] = stillLearning(input, 'a', now);

    expect(next?.reviewStage).toBe(4);
    expect(next?.dueAt).toBe(addDays(now, 30));
  });
});

describe('markMasteredFromReview', () => {
  it('clears schedule fields and sets mastered', () => {
    const now = '2026-08-06T12:00:00.000Z';
    const input = [
      fragment('a', {
        triageStatus: 'review',
        reviewStage: 2,
        dueAt: '2026-08-03T12:00:00.000Z',
        enteredReviewAt: '2026-08-01T12:00:00.000Z',
      }),
    ];

    const [next] = markMasteredFromReview(input, 'a', now);

    expect(next).toMatchObject({
      triageStatus: 'mastered',
      lastReviewedAt: now,
    });
    expect(next?.reviewStage).toBeUndefined();
    expect(next?.dueAt).toBeUndefined();
    expect(next?.enteredReviewAt).toBeUndefined();
  });
});

describe('isDue', () => {
  it('is true when review dueAt is on or before now', () => {
    const now = '2026-08-06T12:00:00.000Z';
    expect(
      isDue(
        fragment('a', {
          triageStatus: 'review',
          dueAt: '2026-08-06T12:00:00.000Z',
        }),
        now,
      ),
    ).toBe(true);
    expect(
      isDue(
        fragment('a', {
          triageStatus: 'review',
          dueAt: '2026-08-05T12:00:00.000Z',
        }),
        now,
      ),
    ).toBe(true);
  });

  it('is false for future due or non-review statuses', () => {
    const now = '2026-08-06T12:00:00.000Z';
    expect(
      isDue(
        fragment('a', {
          triageStatus: 'review',
          dueAt: '2026-08-07T12:00:00.000Z',
        }),
        now,
      ),
    ).toBe(false);
    expect(isDue(fragment('a', { triageStatus: 'pending' }), now)).toBe(false);
  });
});

describe('applySnippetTriageStatus', () => {
  const now = '2026-08-06T12:00:00.000Z';

  it('enters review queue when marking review from inbox', () => {
    const [next] = applySnippetTriageStatus(
      [fragment('a')],
      'a',
      'review',
      now,
    );

    expect(next).toMatchObject({
      triageStatus: 'review',
      reviewStage: 0,
      dueAt: now,
      enteredReviewAt: now,
    });
  });

  it('clears schedule when mastering from review', () => {
    const input = [
      fragment('a', {
        triageStatus: 'review',
        reviewStage: 2,
        dueAt: '2026-08-03T12:00:00.000Z',
        enteredReviewAt: '2026-08-01T12:00:00.000Z',
      }),
    ];

    const [next] = applySnippetTriageStatus(input, 'a', 'mastered', now);

    expect(next).toMatchObject({
      triageStatus: 'mastered',
      lastReviewedAt: now,
    });
    expect(next?.reviewStage).toBeUndefined();
    expect(next?.dueAt).toBeUndefined();
  });

  it('masters from pending without creating schedule fields', () => {
    const [next] = applySnippetTriageStatus(
      [fragment('a')],
      'a',
      'mastered',
      now,
    );

    expect(next).toMatchObject({ triageStatus: 'mastered' });
    expect(next?.dueAt).toBeUndefined();
    expect(next?.lastReviewedAt).toBeUndefined();
  });
});

describe('backfillReviewSchedule', () => {
  it('sets stage 0 and dueAt from capturedAt for review rows missing schedule', () => {
    const backfilled = backfillReviewSchedule(
      fragment('a', {
        triageStatus: 'review',
        capturedAt: '2026-07-01T08:00:00.000Z',
      }),
    );

    expect(backfilled).toMatchObject({
      reviewStage: 0,
      dueAt: '2026-07-01T08:00:00.000Z',
    });
  });
});

describe('dueReviewFragments', () => {
  it('returns due review fragments sorted by dueAt', () => {
    const now = '2026-08-06T12:00:00.000Z';
    const fragments = [
      fragment('late', {
        triageStatus: 'review',
        dueAt: '2026-08-06T10:00:00.000Z',
      }),
      fragment('future', {
        triageStatus: 'review',
        dueAt: '2026-08-10T12:00:00.000Z',
      }),
      fragment('early', {
        triageStatus: 'review',
        dueAt: '2026-08-05T12:00:00.000Z',
      }),
      fragment('pending'),
    ];

    expect(dueReviewFragments(fragments, now).map((item) => item.id)).toEqual([
      'early',
      'late',
    ]);
  });
});
