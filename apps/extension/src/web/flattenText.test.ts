// @vitest-environment happy-dom

import { describe, expect, it } from 'vitest';
import { flattenText } from './flattenText';

describe('flattenText', () => {
  it('joins all visible text nodes back into the original string', () => {
    document.body.innerHTML = '<p>Hello <em>brave</em> world</p>';
    const flat = flattenText(document.body);

    expect(flat.text.replace(/\n/g, ' ').trim()).toBe('Hello brave world');
  });

  it('inserts line breaks between block elements', () => {
    document.body.innerHTML = '<p>First paragraph.</p><p>Second paragraph.</p>';
    const flat = flattenText(document.body);

    expect(flat.text).toContain('First paragraph.');
    expect(flat.text).toContain('Second paragraph.');
    expect(flat.text.indexOf('Second')).toBeGreaterThan(
      flat.text.indexOf('First'),
    );
  });

  it('excludes hidden nodes from the flattened text', () => {
    document.body.innerHTML =
      '<p>Visible text</p><p style="display:none">Hidden text</p>';
    const flat = flattenText(document.body);

    expect(flat.text).toContain('Visible text');
    expect(flat.text).not.toContain('Hidden text');
  });
});
