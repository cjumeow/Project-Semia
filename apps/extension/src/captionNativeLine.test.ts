import { describe, expect, it } from 'vitest';
import { resolveNativeCaptionLine } from './captionNativeLine';

describe('resolveNativeCaptionLine', () => {
  const learning = { text: 'hello world', start: 10, duration: 2 };

  it('returns native text when pairing is high confidence', () => {
    expect(
      resolveNativeCaptionLine(learning, [
        { text: '你好', start: 10.1, duration: 2 },
      ]),
    ).toBe('你好');
  });

  it('returns null when native track is missing', () => {
    expect(resolveNativeCaptionLine(learning, undefined)).toBeNull();
    expect(resolveNativeCaptionLine(learning, [])).toBeNull();
  });

  it('returns null when pairing gate fails', () => {
    expect(
      resolveNativeCaptionLine(learning, [
        { text: '你好', start: 20, duration: 2 },
      ]),
    ).toBeNull();
  });
});
