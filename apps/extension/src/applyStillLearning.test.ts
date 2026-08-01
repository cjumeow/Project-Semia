import { describe, expect, it } from 'vitest';
import type { LanguageFragment } from '@semia/shared';
import { applyStillLearning } from './applyStillLearning';

const webAnchor = {
  kind: 'web' as const,
  textQuote: { exact: 'word' },
  textPosition: { start: 0, end: 4 },
  locateQuality: 'precise' as const,
};

function fragment(
  id: string,
  triageStatus: LanguageFragment['triageStatus'] = 'review',
): LanguageFragment {
  return {
    id,
    selectedText: id,
    contextText: 'context',
    languageCode: 'en',
    sourceUrl: 'https://example.com/page',
    sourceTitle: 'Example',
    capturedAt: '2026-08-01T12:00:00.000Z',
    triageStatus,
    reviewStage: 1,
    dueAt: '2026-08-06T12:00:00.000Z',
    anchor: webAnchor,
  };
}

describe('applyStillLearning', () => {
  const now = '2026-08-06T12:00:00.000Z';

  it('advances schedule for review fragments', () => {
    const result = applyStillLearning([fragment('a')], 'a', now);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.fragments[0]).toMatchObject({
        reviewStage: 2,
        lastReviewedAt: now,
      });
    }
  });

  it('rejects unknown fragment ids', () => {
    expect(applyStillLearning([fragment('a')], 'missing', now)).toEqual({
      ok: false,
      error: 'Fragment not found.',
    });
  });

  it('rejects non-review fragments', () => {
    expect(applyStillLearning([fragment('a', 'pending')], 'a', now)).toEqual({
      ok: false,
      error: 'Fragment is not in review.',
    });
  });
});
