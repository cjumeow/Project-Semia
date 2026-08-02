import type { LanguageFragment } from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

export type ReviewScheduleListMeta = {
  relativeLabel: string;
  absoluteLabel: string;
  sortKey: string;
  emphasis: 'urgent' | 'muted';
};

export function reviewScheduleListMeta(
  fragment: LanguageFragment,
  now: string,
): ReviewScheduleListMeta | null {
  if (effectiveTriageStatus(fragment) !== 'review') {
    return null;
  }

  const dueAt = fragment.dueAt ?? now;
  const dueMs = Date.parse(dueAt);
  const nowMs = Date.parse(now);
  const diffMs = dueMs - nowMs;

  const absoluteDate = formatAbsolute(dueAt);

  if (diffMs > 0) {
    const days = Math.ceil(diffMs / DAY_MS);
    const relativeLabel = `In ${days}d`;
    return {
      relativeLabel,
      absoluteLabel: `${relativeLabel} (${absoluteDate})`,
      sortKey: dueAt,
      emphasis: 'muted',
    };
  }

  const overdueDays = Math.floor((nowMs - dueMs) / DAY_MS);
  if (overdueDays <= 0) {
    return {
      relativeLabel: 'Due now',
      absoluteLabel: `Due now (${absoluteDate})`,
      sortKey: dueAt,
      emphasis: 'urgent',
    };
  }

  const relativeLabel = `${overdueDays}d overdue`;
  return {
    relativeLabel,
    absoluteLabel: `${relativeLabel} (${absoluteDate})`,
    sortKey: dueAt,
    emphasis: 'urgent',
  };
}

export function sortLibrarySnippets<T extends LanguageFragment>(
  snippets: T[],
  sortByReview: boolean,
  now: string,
): T[] {
  if (!sortByReview) {
    return snippets;
  }

  const captureOrder = new Map(
    snippets.map((snippet, index) => [snippet.id, index]),
  );
  const review = snippets
    .filter((snippet) => effectiveTriageStatus(snippet) === 'review')
    .sort((a, b) => (a.dueAt ?? now).localeCompare(b.dueAt ?? now));
  const mastered = snippets
    .filter((snippet) => effectiveTriageStatus(snippet) === 'mastered')
    .sort(
      (a, b) => (captureOrder.get(a.id) ?? 0) - (captureOrder.get(b.id) ?? 0),
    );

  return [...review, ...mastered];
}

function formatAbsolute(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function effectiveTriageStatus(
  fragment: LanguageFragment,
): LanguageFragment['triageStatus'] {
  return fragment.triageStatus ?? 'pending';
}
