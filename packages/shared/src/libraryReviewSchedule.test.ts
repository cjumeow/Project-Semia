import { describe, expect, it } from 'vitest';
import type { LanguageFragment } from './types';
import { addDays } from './reviewSchedule';
import {
  reviewScheduleListMeta,
  sortLibrarySnippets,
} from './libraryReviewSchedule';

const NOW = '2026-08-06T12:00:00.000Z';

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

describe('reviewScheduleListMeta', () => {
  it('returns null for pending snippets', () => {
    expect(reviewScheduleListMeta(fragment('a'), NOW)).toBeNull();
  });

  it('returns null for mastered snippets', () => {
    expect(
      reviewScheduleListMeta(fragment('a', { triageStatus: 'mastered' }), NOW),
    ).toBeNull();
  });

  it('labels a future due date as In Nd with muted emphasis', () => {
    const meta = reviewScheduleListMeta(
      fragment('a', {
        triageStatus: 'review',
        dueAt: addDays(NOW, 3),
      }),
      NOW,
    );

    expect(meta).toMatchObject({
      relativeLabel: 'In 3d',
      emphasis: 'muted',
      sortKey: addDays(NOW, 3),
    });
    expect(meta?.absoluteLabel).toContain('In 3d');
  });

  it('labels due exactly now as Due now with urgent emphasis', () => {
    const meta = reviewScheduleListMeta(
      fragment('a', { triageStatus: 'review', dueAt: NOW }),
      NOW,
    );

    expect(meta).toMatchObject({
      relativeLabel: 'Due now',
      emphasis: 'urgent',
      sortKey: NOW,
    });
  });

  it('labels past due dates as Nd overdue with urgent emphasis', () => {
    const dueAt = addDays(NOW, -2);
    const meta = reviewScheduleListMeta(
      fragment('a', { triageStatus: 'review', dueAt }),
      NOW,
    );

    expect(meta).toMatchObject({
      relativeLabel: '2d overdue',
      emphasis: 'urgent',
      sortKey: dueAt,
    });
  });

  it('treats legacy review rows without dueAt as Due now', () => {
    const meta = reviewScheduleListMeta(
      fragment('a', { triageStatus: 'review' }),
      NOW,
    );

    expect(meta).toMatchObject({
      relativeLabel: 'Due now',
      emphasis: 'urgent',
      sortKey: NOW,
    });
  });
});

describe('sortLibrarySnippets', () => {
  const snippets = [
    fragment('cap-1', { triageStatus: 'mastered' }),
    fragment('rev-waiting', {
      triageStatus: 'review',
      dueAt: addDays(NOW, 4),
    }),
    fragment('rev-overdue', {
      triageStatus: 'review',
      dueAt: addDays(NOW, -1),
    }),
    fragment('cap-2', { triageStatus: 'mastered' }),
    fragment('rev-due-now', { triageStatus: 'review', dueAt: NOW }),
  ];

  it('preserves capture order when sort is off', () => {
    expect(sortLibrarySnippets(snippets, false, NOW).map((s) => s.id)).toEqual([
      'cap-1',
      'rev-waiting',
      'rev-overdue',
      'cap-2',
      'rev-due-now',
    ]);
  });

  it('sorts review rows by dueAt then mastered in capture order', () => {
    expect(sortLibrarySnippets(snippets, true, NOW).map((s) => s.id)).toEqual([
      'rev-overdue',
      'rev-due-now',
      'rev-waiting',
      'cap-1',
      'cap-2',
    ]);
  });

  it('sorts legacy review rows among due-now items using now as sort key', () => {
    const withLegacy = [
      fragment('legacy', { triageStatus: 'review' }),
      fragment('due', { triageStatus: 'review', dueAt: NOW }),
    ];

    expect(
      sortLibrarySnippets(withLegacy, true, NOW).map((s) => s.id),
    ).toEqual(['legacy', 'due']);
  });
});
