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
    ).toEqual({ status: 'text', text: '你好' });
  });

  it('returns none when native track is missing and no MT', () => {
    expect(resolveNativeCaptionLine(learning, undefined)).toEqual({
      status: 'none',
    });
    expect(resolveNativeCaptionLine(learning, [])).toEqual({ status: 'none' });
  });

  it('falls back to MT when pairing gate fails on non-coarse track', () => {
    const misaligned = [{ text: '你好', start: 20, duration: 2 }];
    expect(
      resolveNativeCaptionLine(learning, misaligned, { mtPrewarmActive: true }),
    ).toEqual({ status: 'loading' });
    expect(
      resolveNativeCaptionLine(learning, misaligned, {
        cueIndex: 0,
        mtTranslations: new Map([[0, '翻譯']]),
      }),
    ).toEqual({ status: 'text', text: '翻譯' });
    expect(
      resolveNativeCaptionLine(learning, misaligned, {
        cueIndex: 0,
        mtTranslations: new Map([[0, '翻譯']]),
        mtPrewarmActive: true,
      }),
    ).toEqual({ status: 'loading' });
  });

  it('returns none while native line is suppressed during refetch', () => {
    expect(
      resolveNativeCaptionLine(
        learning,
        [{ text: '你好', start: 10.1, duration: 2 }],
        { nativeLineSuppressed: true },
      ),
    ).toEqual({ status: 'none' });
  });

  it('returns MT text on coarse track when cache has cue', () => {
    const alignedNative = { text: '你好', start: 10.1, duration: 2 };
    const mt = new Map([[0, '翻譯中']]);
    expect(
      resolveNativeCaptionLine(learning, [alignedNative], {
        learningSegmentCount: 100,
        cueIndex: 0,
        mtTranslations: mt,
      }),
    ).toEqual({ status: 'text', text: '翻譯中' });
    expect(isCoarseNativeTrack(100, 50)).toBe(true);
    expect(
      pairNativeForLearningCue(learning, [alignedNative], {
        coarseNativeTrack: true,
      }).confidence,
    ).toBe('high');
  });

  it('returns loading on coarse track while prewarm is active', () => {
    expect(
      resolveNativeCaptionLine(learning, [{ text: 'x', start: 0, duration: 1 }], {
        learningSegmentCount: 100,
        cueIndex: 0,
        mtPrewarmActive: true,
      }),
    ).toEqual({ status: 'loading' });
  });

  it('skips tlang when skipTlangPairing is set even on non-coarse track', () => {
    expect(
      resolveNativeCaptionLine(
        learning,
        [{ text: '你好', start: 10.1, duration: 2 }],
        { skipTlangPairing: true, mtPrewarmActive: true },
      ),
    ).toEqual({ status: 'loading' });
  });

  it('returns none on coarse track without MT cache', () => {
    expect(
      resolveNativeCaptionLine(learning, [{ text: 'x', start: 0, duration: 1 }], {
        learningSegmentCount: 100,
        cueIndex: 0,
      }),
    ).toEqual({ status: 'none' });
  });
});
