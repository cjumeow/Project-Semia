import { describe, expect, it } from 'vitest';
import {
  effectiveWebLocateQuality,
  hasLikelyLatexOrMathMarkup,
  inferWebLocateQuality,
  isDegradedWebAnchor,
  isUncertainWebAnchor,
  isWebJumpBackReliable,
} from './webAnchor';
import type { WebAnchor } from './types';

const anchor = (overrides: Partial<WebAnchor> = {}): WebAnchor => ({
  kind: 'web',
  textQuote: { exact: 'hello world' },
  textPosition: { start: 10, end: 21 },
  locateQuality: 'precise',
  ...overrides,
});

describe('inferWebLocateQuality', () => {
  it('marks placeholder textPosition without prefix/suffix as degraded', () => {
    expect(
      inferWebLocateQuality(
        { exact: 'hello world' },
        { start: 0, end: 'hello world'.length },
      ),
    ).toBe('degraded');
  });

  it('marks located offsets with disambiguation as precise', () => {
    expect(
      inferWebLocateQuality(
        { exact: 'hello', prefix: 'say ', suffix: ' there' },
        { start: 4, end: 9 },
      ),
    ).toBe('precise');
  });
});

describe('effectiveWebLocateQuality', () => {
  it('infers uncertain from LaTeX in legacy precise captures', () => {
    expect(
      effectiveWebLocateQuality(anchor(), String.raw`x^{2}`),
    ).toBe('uncertain');
  });
});

describe('isDegradedWebAnchor', () => {
  it('is true only for degraded quality', () => {
    expect(isDegradedWebAnchor(anchor({ locateQuality: 'degraded' }))).toBe(
      true,
    );
    expect(isDegradedWebAnchor(anchor({ locateQuality: 'precise' }))).toBe(
      false,
    );
  });
});

describe('isUncertainWebAnchor', () => {
  it('is true for uncertain quality and LaTeX legacy captures', () => {
    expect(isUncertainWebAnchor(anchor({ locateQuality: 'uncertain' }))).toBe(
      true,
    );
    expect(
      isUncertainWebAnchor(anchor(), String.raw`\sqrt{2}`),
    ).toBe(true);
  });
});

describe('isWebJumpBackReliable', () => {
  it('is false only for degraded anchors', () => {
    expect(isWebJumpBackReliable(anchor({ locateQuality: 'degraded' }))).toBe(
      false,
    );
    expect(isWebJumpBackReliable(anchor({ locateQuality: 'uncertain' }))).toBe(
      true,
    );
    expect(isWebJumpBackReliable(anchor({ locateQuality: 'precise' }))).toBe(
      true,
    );
  });
});

describe('hasLikelyLatexOrMathMarkup', () => {
  it('detects backslash commands', () => {
    expect(hasLikelyLatexOrMathMarkup(String.raw`\dots`)).toBe(true);
  });
});
