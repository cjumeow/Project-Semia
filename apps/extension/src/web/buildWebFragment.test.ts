// @vitest-environment happy-dom

import { describe, expect, it } from 'vitest';
import { buildWebFragment } from './buildWebFragment';

describe('buildWebFragment', () => {
  it('returns locate-failed when selection text is not found in the page', () => {
    document.body.innerHTML = '<p>Only this text exists.</p>';
    const range = {
      toString: () => 'missing from page',
    } as Range;

    const result = buildWebFragment(range);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('locate-failed');
    }
  });

  it('returns a precise web fragment when selection maps to page text', () => {
    document.body.innerHTML = '<p>Hello <em>brave</em> world</p>';
    const em = document.querySelector('em')!;
    const range = document.createRange();
    range.selectNodeContents(em);

    const result = buildWebFragment(range);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.fragment.selectedText).toBe('brave');
      expect(result.fragment.anchor.kind).toBe('web');
      if (result.fragment.anchor.kind === 'web') {
        expect(result.fragment.anchor.locateQuality).toBe('precise');
        expect(result.fragment.anchor.textPosition.start).toBeGreaterThan(0);
      }
    }
  });

  it('captures a multi-node selection from the live Range', () => {
    document.body.innerHTML = '<p>Hello <em>brave</em> world</p>';
    const p = document.querySelector('p')!;
    const range = document.createRange();
    range.setStart(p.firstChild!, 0);
    range.setEnd(p.lastChild!, p.lastChild!.textContent!.length);

    const result = buildWebFragment(range);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.fragment.selectedText).toBe('Hello brave world');
      if (result.fragment.anchor.kind === 'web') {
        expect(result.fragment.anchor.locateQuality).toBe('precise');
      }
    }
  });

  it('marks LaTeX selections as uncertain at capture time', () => {
    document.body.innerHTML =
      '<p>multiply them all together, we would get 10^{1.414\\dots}</p>';
    const p = document.querySelector('p')!;
    const range = document.createRange();
    range.selectNodeContents(p);

    const result = buildWebFragment(range);

    expect(result.ok).toBe(true);
    if (result.ok && result.fragment.anchor.kind === 'web') {
      expect(result.fragment.anchor.locateQuality).toBe('uncertain');
    }
  });
});
