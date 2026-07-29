import { describe, expect, it } from 'vitest';
import { extractContext } from './extractContext';
import type { FlatText } from './flattenText';

function makeFlat(text: string): FlatText {
  return { text, chunks: [] };
}

describe('extractContext', () => {
  it('returns surrounding text around the selection', () => {
    const flat = makeFlat(
      'Alpha sentence. Target phrase here. Omega sentence.',
    );

    const context = extractContext(flat, 16, 33);

    expect(context).toContain('Target phrase here');
    expect(context).toContain('Alpha sentence');
    expect(context).toContain('Omega sentence');
  });

  it('keeps the selected phrase inside a longer surrounding window', () => {
    const padding = 'A. '.repeat(500);
    const flat = makeFlat(`${padding}Alpha. Target phrase. Beta.`);

    const start = flat.text.indexOf('Target');
    const end = flat.text.indexOf('phrase') + 'phrase'.length;
    const context = extractContext(flat, start, end);

    expect(context).toContain('Target phrase');
    expect(context).toContain('Beta.');
  });
});
