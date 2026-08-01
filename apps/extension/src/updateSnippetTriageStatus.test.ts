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
  it('updates the matching fragment to review', () => {
    const fragments = [fragment('a'), fragment('b')];

    const result = applySnippetTriageStatus(fragments, 'a', 'review');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.fragments.find((item) => item.id === 'a')?.triageStatus).toBe(
        'review',
      );
      expect(result.fragments.find((item) => item.id === 'b')?.triageStatus).toBe(
        'pending',
      );
    }
  });

  it('rejects unknown fragment ids', () => {
    const result = applySnippetTriageStatus([fragment('a')], 'missing', 'review');

    expect(result).toEqual({ ok: false, error: 'Fragment not found.' });
  });

  it('rejects pending as a write target', () => {
    const result = applySnippetTriageStatus([fragment('a')], 'a', 'pending');

    expect(result).toEqual({ ok: false, error: 'Invalid triage status.' });
  });
});
