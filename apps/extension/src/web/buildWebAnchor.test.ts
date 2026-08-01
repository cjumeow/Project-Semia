// @vitest-environment happy-dom

import { describe, expect, it } from 'vitest';
import { buildWebAnchor } from './buildWebAnchor';
import { flattenText } from './flattenText';

describe('buildWebAnchor', () => {
  it('marks precise anchors with prefix and suffix from page offsets', () => {
    document.body.innerHTML =
      '<p>Before the <strong>target phrase</strong> after.</p>';
    const flat = flattenText(document.body);
    const start = flat.text.indexOf('target phrase');
    const end = start + 'target phrase'.length;

    const anchor = buildWebAnchor(flat, 'target phrase', { start, end });

    expect(anchor.locateQuality).toBe('precise');
    expect(anchor.textQuote.prefix).toContain('Before');
    expect(anchor.textQuote.suffix).toContain('after');
    expect(anchor.textPosition).toEqual({ start, end });
  });
});
