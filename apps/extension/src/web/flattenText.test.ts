// @vitest-environment happy-dom

import { describe, expect, it } from 'vitest';
import { findFlatRange, flattenText } from './flattenText';

describe('flattenText', () => {
  it('keeps inline markup on one line with original spacing', () => {
    document.body.innerHTML = '<p>Hello <em>brave</em> world</p>';
    const flat = flattenText(document.body);

    expect(flat.text).toBe('Hello brave world');
  });

  it('separates block elements with a line break', () => {
    document.body.innerHTML = '<p>First paragraph.</p><p>Second paragraph.</p>';
    const flat = flattenText(document.body);

    expect(flat.text).toBe('First paragraph.\nSecond paragraph.');
  });

  it('excludes hidden and non-content nodes', () => {
    document.body.innerHTML =
      '<p>Visible text</p>' +
      '<p style="display:none">Hidden text</p>' +
      '<script>const secret = 1;</script>';
    const flat = flattenText(document.body);

    expect(flat.text).toBe('Visible text');
  });

  it('collapses runs of whitespace inside a text node', () => {
    document.body.innerHTML = '<p>spaced\n\n   out   text</p>';
    const flat = flattenText(document.body);

    expect(flat.text).toBe('spaced out text');
  });
});

describe('findFlatRange', () => {
  it('locates a selection that spans inline markup', () => {
    document.body.innerHTML = '<p>Hello <em>brave</em> world</p>';
    const flat = flattenText(document.body);

    const found = findFlatRange(flat, 'Hello brave world');

    expect(found).toEqual({ start: 0, end: 17 });
  });

  it('matches across a block boundary where the flat text has a newline', () => {
    document.body.innerHTML = '<p>First paragraph.</p><p>Second paragraph.</p>';
    const flat = flattenText(document.body);

    const found = findFlatRange(flat, 'First paragraph. Second paragraph.');

    expect(found).not.toBeNull();
    expect(flat.text.slice(found!.start, found!.end)).toBe(
      'First paragraph.\nSecond paragraph.',
    );
  });

  it('escapes regex metacharacters in the selection', () => {
    document.body.innerHTML = '<p>Costs $5 (roughly) per item.</p>';
    const flat = flattenText(document.body);

    const found = findFlatRange(flat, '$5 (roughly)');

    expect(found).not.toBeNull();
    expect(flat.text.slice(found!.start, found!.end)).toBe('$5 (roughly)');
  });

  it('returns null when the selection is not in the flattened text', () => {
    document.body.innerHTML = '<p>Hello world</p>';
    const flat = flattenText(document.body);

    expect(findFlatRange(flat, 'not on this page')).toBeNull();
  });
});
