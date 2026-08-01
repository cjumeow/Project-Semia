import { describe, expect, it } from 'vitest';
import type { LanguageFragment } from '@semia/shared';
import { applySnippetTriageStatus } from './updateSnippetTriageStatus';

const webAnchor = {
  kind: 'web' as const,
  textQuote: { exact: 'word' },
  textPosition: { start: 0, end: 4 },
  locateQuality: 'precise' as const,
};

function fragment(
  id: string,
  triageStatus: LanguageFragment['triageStatus'] = 'pending',
): LanguageFragment {
  return {
    id,
    selectedText: id,
    contextText: 'context',
    languageCode: 'en',
    sourceUrl: 'https://example.com/page',
    sourceTitle: 'Example',
    capturedAt: '2026-01-01T00:00:00.000Z',
    triageStatus,
    anchor: webAnchor,
  };
}

describe('applySnippetTriageStatus', () => {
  const now = '2026-08-06T12:00:00.000Z';

  it('enters review queue when marking review', () => {
    const fragments = [fragment('a'), fragment('b')];

    const result = applySnippetTriageStatus(fragments, 'a', 'review', now);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.fragments.find((item) => item.id === 'a')).toMatchObject({
        triageStatus: 'review',
        reviewStage: 0,
        dueAt: now,
      });
      expect(result.fragments.find((item) => item.id === 'b')?.triageStatus).toBe(
        'pending',
      );
    }
  });

  it('clears schedule when mastering from review', () => {
    const fragments = [
      fragment('a', 'review'),
      fragment('b', 'pending'),
    ];
    fragments[0] = {
      ...fragments[0]!,
      reviewStage: 1,
      dueAt: now,
    };

    const result = applySnippetTriageStatus(fragments, 'a', 'mastered', now);

    expect(result.ok).toBe(true);
    if (result.ok) {
      const updated = result.fragments.find((item) => item.id === 'a');
      expect(updated?.triageStatus).toBe('mastered');
      expect(updated?.dueAt).toBeUndefined();
      expect(updated?.lastReviewedAt).toBe(now);
    }
  });

  it('rejects unknown fragment ids', () => {
    const result = applySnippetTriageStatus([fragment('a')], 'missing', 'review', now);

    expect(result).toEqual({ ok: false, error: 'Fragment not found.' });
  });

  it('rejects pending as a write target', () => {
    const result = applySnippetTriageStatus([fragment('a')], 'a', 'pending', now);

    expect(result).toEqual({ ok: false, error: 'Invalid triage status.' });
  });
});
