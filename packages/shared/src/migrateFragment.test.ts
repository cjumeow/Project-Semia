import { describe, expect, it } from 'vitest';
import type { LegacyLanguageFragment } from './types';
import { migrateFragment } from './migrateFragment';
import { normalizeFragments } from './normalizeFragments';

const legacyFixture: LegacyLanguageFragment = {
  id: 'legacy-1',
  videoId: 'abc123',
  videoUrl: 'https://www.youtube.com/watch?v=abc123',
  languageCode: 'en',
  selectedText: 'break a leg',
  selection: {
    start: { cueIndex: 4, wordIndex: 0 },
    end: { cueIndex: 4, wordIndex: 2 },
  },
  focusWord: { cueIndex: 4, wordIndex: 0, text: 'break' },
  contextCues: [
    { text: 'Good luck out there.', start: 15, duration: 3 },
    { text: 'Break a leg!', start: 18, duration: 2 },
  ],
  contextCueIndices: [3, 5],
  start: 18,
  end: 20,
  capturedAt: '2026-07-29T00:00:00.000Z',
};

const migratedFixture = {
  id: 'legacy-1',
  selectedText: 'break a leg',
  contextText: 'Good luck out there. Break a leg!',
  languageCode: 'en',
  sourceUrl: 'https://www.youtube.com/watch?v=abc123',
  sourceTitle: 'YouTube · abc123',
  capturedAt: '2026-07-29T00:00:00.000Z',
  triageStatus: 'pending' as const,
  anchor: {
    kind: 'youtube' as const,
    videoId: 'abc123',
    selection: legacyFixture.selection,
    focusWord: legacyFixture.focusWord,
    contextCues: legacyFixture.contextCues,
    contextCueIndices: legacyFixture.contextCueIndices,
    startSeconds: 18,
    endSeconds: 20,
  },
};

describe('migrateFragment', () => {
  it('upgrades legacy flat fragments with contextText from cues', () => {
    const migrated = migrateFragment(legacyFixture);

    expect(migrated).toEqual(migratedFixture);
    expect(migrated?.anchor.kind).toBe('youtube');
    if (migrated?.anchor.kind === 'youtube') {
      expect(migrated.anchor.videoId).toBe('abc123');
      expect(migrated.anchor.startSeconds).toBe(18);
    }
  });

  it('passes through already-migrated fragments without reshaping', () => {
    const first = migrateFragment(migratedFixture);
    const second = migrateFragment(first);

    expect(first).toEqual(migratedFixture);
    expect(second).toEqual(migratedFixture);
  });

  it('keeps new-format fragments even without a top-level videoId', () => {
    const fragments = normalizeFragments([migratedFixture]);

    expect(fragments).toHaveLength(1);
    expect(fragments[0]?.id).toBe('legacy-1');
  });

  it('drops rows missing selectedText', () => {
    expect(
      normalizeFragments([{ ...legacyFixture, selectedText: undefined }]),
    ).toEqual([]);
  });

  it('drops rows missing id', () => {
    expect(normalizeFragments([{ ...legacyFixture, id: undefined }])).toEqual(
      [],
    );
  });

  it('migrates legacy rows from object-map storage', () => {
    const fragments = normalizeFragments({
      a: legacyFixture,
      b: { ...legacyFixture, id: 'legacy-2', selectedText: 'hello' },
    });

    expect(fragments.map((fragment) => fragment.id)).toEqual([
      'legacy-1',
      'legacy-2',
    ]);
  });

  it('defaults missing triageStatus to pending', () => {
    const { triageStatus: _, ...withoutStatus } = migratedFixture;
    const migrated = migrateFragment(withoutStatus);

    expect(migrated?.triageStatus).toBe('pending');
  });

  it('preserves stored triageStatus when present', () => {
    const migrated = migrateFragment({
      ...migratedFixture,
      triageStatus: 'review',
    });

    expect(migrated?.triageStatus).toBe('review');
  });

  it('backfills legacy review rows without schedule as due at capturedAt', () => {
    const migrated = migrateFragment({
      ...migratedFixture,
      triageStatus: 'review',
      capturedAt: '2026-07-29T00:00:00.000Z',
    });

    expect(migrated).toMatchObject({
      triageStatus: 'review',
      reviewStage: 0,
      dueAt: '2026-07-29T00:00:00.000Z',
    });
  });

  it('preserves stored schedule fields on review rows', () => {
    const migrated = migrateFragment({
      ...migratedFixture,
      triageStatus: 'review',
      reviewStage: 2,
      dueAt: '2026-08-10T12:00:00.000Z',
      enteredReviewAt: '2026-08-01T12:00:00.000Z',
      lastReviewedAt: '2026-08-05T12:00:00.000Z',
    });

    expect(migrated).toMatchObject({
      triageStatus: 'review',
      reviewStage: 2,
      dueAt: '2026-08-10T12:00:00.000Z',
      enteredReviewAt: '2026-08-01T12:00:00.000Z',
      lastReviewedAt: '2026-08-05T12:00:00.000Z',
    });
  });

  it('does not backfill schedule fields for pending or mastered rows', () => {
    const pending = migrateFragment({
      ...migratedFixture,
      triageStatus: 'pending',
    });
    const mastered = migrateFragment({
      ...migratedFixture,
      triageStatus: 'mastered',
    });

    expect(pending?.dueAt).toBeUndefined();
    expect(pending?.reviewStage).toBeUndefined();
    expect(mastered?.dueAt).toBeUndefined();
    expect(mastered?.reviewStage).toBeUndefined();
  });
});
