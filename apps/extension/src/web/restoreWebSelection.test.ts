// @vitest-environment happy-dom

import { describe, expect, it } from 'vitest';
import {
  findFlatRangeWithQuote,
  restoreWebSelection,
} from './restoreWebSelection';
import { flattenText } from './flattenText';

describe('findFlatRangeWithQuote', () => {
  it('picks the occurrence that matches prefix and suffix', () => {
    document.body.innerHTML =
      '<p>Alpha target text here.</p><p>Omega target text end.</p>';
    const flat = flattenText(document.body);

    const found = findFlatRangeWithQuote(flat, {
      exact: 'target text',
      prefix: 'Omega',
      suffix: 'end',
    });

    expect(found).not.toBeNull();
    expect(flat.text.slice(found!.start, found!.end)).toBe('target text');
    expect(flat.text.slice(0, found!.start)).toContain('Omega');
  });
});

describe('restoreWebSelection', () => {
  it('applies a native selection around the matched text', () => {
    document.body.innerHTML = '<p>Hello <em>brave</em> world</p>';

    const restored = restoreWebSelection(document.body, {
      selectedText: 'brave',
      textQuote: { exact: 'brave' },
    });

    expect(restored).toBe(true);
    expect(window.getSelection()?.toString()).toBe('brave');
  });
});
