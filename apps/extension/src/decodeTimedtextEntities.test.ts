import { describe, expect, it } from 'vitest';
import { decodeTimedtextEntities } from './decodeTimedtextEntities';

describe('decodeTimedtextEntities', () => {
  it('decodes apostrophe entities in learning cues', () => {
    expect(decodeTimedtextEntities("That&#39;s cool")).toBe("That's cool");
    expect(decodeTimedtextEntities('it&#x27;s fine')).toBe("it's fine");
  });

  it('decodes common named entities', () => {
    expect(decodeTimedtextEntities('a &amp; b &lt; c')).toBe('a & b < c');
  });
});
