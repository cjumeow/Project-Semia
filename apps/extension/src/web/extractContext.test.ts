import { describe, expect, it } from 'vitest';
import { extractContext } from './extractContext';
import type { FlatText } from './flattenText';

function makeFlat(text: string): FlatText {
  return { text, chunks: [] };
}

/** Long filler so the selection sits far from both document edges. */
function filler(sentences: number): string {
  return 'Filler sentence here. '.repeat(sentences);
}

function locate(flat: FlatText, needle: string): { start: number; end: number } {
  const start = flat.text.indexOf(needle);
  return { start, end: start + needle.length };
}

describe('extractContext', () => {
  it('returns surrounding text around the selection', () => {
    const flat = makeFlat('Alpha sentence. Target phrase here. Omega sentence.');
    const { start, end } = locate(flat, 'Target phrase here');

    const context = extractContext(flat, start, end);

    expect(context).toContain('Target phrase here');
    expect(context).toContain('Alpha sentence');
    expect(context).toContain('Omega sentence');
  });

  it('trims both edges to sentence boundaries when the article continues past the window', () => {
    const flat = makeFlat(
      `${filler(120)}Target phrase here. ${filler(120)}`,
    );
    const { start, end } = locate(flat, 'Target phrase here');

    const context = extractContext(flat, start, end);

    expect(context).toContain('Target phrase here');
    expect(context.startsWith('Filler')).toBe(true);
    expect(context.length).toBeLessThan(flat.text.length);
  });

  it('always keeps the selected text inside the context', () => {
    const needle = 'Target phrase here';
    const cases: FlatText[] = [
      makeFlat(`${filler(120)}${needle}. ${filler(120)}`),
      // No sentence break before the selection inside the window.
      makeFlat(`${'word '.repeat(600)}${needle}. ${filler(120)}`),
      // No sentence break after the selection inside the window.
      makeFlat(`${filler(120)}${needle} ${'word '.repeat(600)}`),
    ];

    for (const flat of cases) {
      const { start, end } = locate(flat, needle);
      expect(extractContext(flat, start, end)).toContain(needle);
    }
  });

  it('keeps the whole article when it fits inside the window', () => {
    const flat = makeFlat('Short article. Target phrase here. The end.');
    const { start, end } = locate(flat, 'Target phrase here');

    expect(extractContext(flat, start, end)).toBe(flat.text);
  });
});
