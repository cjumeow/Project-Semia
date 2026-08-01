import { describe, expect, it } from 'vitest';
import { getWebJumpBackHint } from './webRestoreStatus';
import { hasLikelyLatexOrMathMarkup } from './webAnchor';
import type { WebAnchor } from './types';

const anchor = (overrides: Partial<WebAnchor> = {}): WebAnchor => ({
  kind: 'web',
  textQuote: { exact: 'hello world' },
  textPosition: { start: 10, end: 21 },
  locateQuality: 'precise',
  ...overrides,
});

describe('getWebJumpBackHint', () => {
  it('returns degraded copy for degraded anchors', () => {
    expect(
      getWebJumpBackHint(anchor({ locateQuality: 'degraded' }))?.kind,
    ).toBe('unavailable');
  });

  it('returns failed copy when the last attempt failed', () => {
    expect(
      getWebJumpBackHint(anchor(), { restoreFailed: true })?.kind,
    ).toBe('failed');
  });

  it('hides uncertain hint after a successful restore', () => {
    expect(
      getWebJumpBackHint(anchor({ locateQuality: 'uncertain' }), {
        restoreSucceeded: true,
        selectedText: String.raw`10^{1.414\dots}`,
      }),
    ).toBeUndefined();
  });

  it('warns for LaTeX selections stored as precise (legacy)', () => {
    expect(
      getWebJumpBackHint(anchor(), {
        selectedText: String.raw`102\sqrt{102}`,
      })?.kind,
    ).toBe('uncertain');
  });

  it('warns for uncertain anchors before restore is tried', () => {
    expect(
      getWebJumpBackHint(anchor({ locateQuality: 'uncertain' }))?.kind,
    ).toBe('uncertain');
  });

  it('returns undefined for plain precise anchors', () => {
    expect(
      getWebJumpBackHint(anchor(), {
        selectedText: 'also assume a few other properties',
      }),
    ).toBeUndefined();
  });
});

describe('hasLikelyLatexOrMathMarkup', () => {
  it('detects LaTeX in captured text', () => {
    expect(hasLikelyLatexOrMathMarkup(String.raw`10^{1.414\dots}`)).toBe(true);
  });
});
