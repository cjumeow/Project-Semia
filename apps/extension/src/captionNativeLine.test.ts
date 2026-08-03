import { describe, expect, it } from 'vitest';
import {
  isCoarseNativeTrack,
  pairNativeForLearningCue,
} from './cuePairing';
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

  it('returns null while native line is suppressed during refetch', () => {
    expect(
      resolveNativeCaptionLine(
        learning,
        [{ text: '你好', start: 10.1, duration: 2 }],
        { nativeLineSuppressed: true },
      ),
    ).toBeNull();
  });

  it('returns null on coarse track when native text exceeds coarse length gate', () => {
    const longNative = {
      text: '这是一段明显比学习句更长的中文翻译内容。',
      start: 10.1,
      duration: 2,
    };
    expect(
      resolveNativeCaptionLine(learning, [longNative], {
        learningSegmentCount: 100,
      }),
    ).toBeNull();
    expect(isCoarseNativeTrack(100, 50)).toBe(true);
    expect(
      pairNativeForLearningCue(learning, [longNative], {
        coarseNativeTrack: true,
      }).reason,
    ).toBe('length');
  });
});
