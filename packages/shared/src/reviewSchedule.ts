import type { LanguageFragment, ReviewStage, SnippetTriageStatus } from './types';

export const STAGE_LABELS: Record<ReviewStage, string> = {
  0: 'immediate',
  1: '1d',
  2: '3d',
  3: '14d',
  4: '30d+',
};

/** Days until next due after Still learning at `stage`. */
export function intervalDaysAfterStillLearning(stage: ReviewStage): number {
  switch (stage) {
    case 0:
      return 1;
    case 1:
      return 3;
    case 2:
      return 14;
    case 3:
    case 4:
      return 30;
  }
}

export function nextReviewStage(stage: ReviewStage): ReviewStage {
  return stage < 4 ? ((stage + 1) as ReviewStage) : 4;
}

export function addDays(iso: string, days: number): string {
  const date = new Date(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

export function isDue(fragment: LanguageFragment, now: string): boolean {
  return (
    effectiveTriageStatus(fragment) === 'review' &&
    fragment.dueAt !== undefined &&
    fragment.dueAt <= now
  );
}

export function dueReviewFragments(
  fragments: LanguageFragment[],
  now: string,
): LanguageFragment[] {
  return fragments
    .filter((fragment) => isDue(fragment, now))
    .sort((a, b) => (a.dueAt ?? '').localeCompare(b.dueAt ?? ''));
}

export function enterReviewQueue(
  fragments: LanguageFragment[],
  fragmentId: string,
  now: string,
): LanguageFragment[] {
  return fragments.map((fragment) => {
    if (
      fragment.id !== fragmentId ||
      effectiveTriageStatus(fragment) !== 'pending'
    ) {
      return fragment;
    }
    return {
      ...fragment,
      triageStatus: 'review',
      enteredReviewAt: now,
      reviewStage: 0,
      dueAt: now,
      lastReviewedAt: undefined,
    };
  });
}

export function stillLearning(
  fragments: LanguageFragment[],
  fragmentId: string,
  now: string,
): LanguageFragment[] {
  return fragments.map((fragment) => {
    if (
      fragment.id !== fragmentId ||
      effectiveTriageStatus(fragment) !== 'review'
    ) {
      return fragment;
    }
    const stage = fragment.reviewStage ?? 0;
    const nextStage = nextReviewStage(stage);
    const days = intervalDaysAfterStillLearning(stage);
    return {
      ...fragment,
      reviewStage: nextStage,
      dueAt: addDays(now, days),
      lastReviewedAt: now,
    };
  });
}

export function markMasteredFromReview(
  fragments: LanguageFragment[],
  fragmentId: string,
  now: string,
): LanguageFragment[] {
  return fragments.map((fragment) => {
    if (
      fragment.id !== fragmentId ||
      effectiveTriageStatus(fragment) !== 'review'
    ) {
      return fragment;
    }
    return clearReviewSchedule({
      ...fragment,
      triageStatus: 'mastered',
      lastReviewedAt: now,
    });
  });
}

/** Backfill legacy `review` rows that predate schedule fields. */
export function backfillReviewSchedule(
  fragment: LanguageFragment,
): LanguageFragment {
  if (effectiveTriageStatus(fragment) !== 'review') {
    return fragment;
  }
  if (fragment.dueAt !== undefined) {
    return fragment;
  }
  return {
    ...fragment,
    reviewStage: fragment.reviewStage ?? 0,
    // Stable anchor: capturedAt is always in the past for real captures.
    dueAt: fragment.capturedAt,
  };
}

export function clearReviewSchedule(
  fragment: LanguageFragment,
): LanguageFragment {
  return {
    ...fragment,
    enteredReviewAt: undefined,
    reviewStage: undefined,
    dueAt: undefined,
  };
}

function effectiveTriageStatus(fragment: LanguageFragment): SnippetTriageStatus {
  return fragment.triageStatus ?? 'pending';
}
