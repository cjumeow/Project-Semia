import { describe, expect, it } from 'vitest';
import {
  isCoarseNativeTrack,
  pairNativeForLearningCue,
} from './cuePairing';
import { resolveNativeCaptionLine } from './captionNativeLine';
import FIXTURE from './fixtures/lex-e-gwvmhyU7A-stick-repro.json';

describe('Lex #434 stick repro (e-gwvmhyU7A @ ~1:57:41)', () => {
  const { learning, nativeZhHans, nativeZhHant, trackStats } = FIXTURE;

  it('flags both zh-Hans and zh-Hant tlang tracks as coarse vs learning', () => {
    expect(
      isCoarseNativeTrack(
        trackStats.learningCount,
        trackStats.nativeZhHansCount,
      ),
    ).toBe(true);
    expect(
      isCoarseNativeTrack(
        trackStats.learningCount,
        trackStats.nativeZhHantCount,
      ),
    ).toBe(true);
  });

  it('pairs zh-Hans with high confidence', () => {
    const result = pairNativeForLearningCue(learning, [nativeZhHans], {
      coarseNativeTrack: true,
    });

    expect(result.confidence).toBe('high');
    expect(result.nativeText).toBe(nativeZhHans.text);
  });

  it('rejects zh-Hant merged paragraph (granularity / semantic mismatch)', () => {
    const result = pairNativeForLearningCue(learning, [nativeZhHant], {
      coarseNativeTrack: true,
    });

    expect(result.confidence).toBe('none');
    expect(result.nativeText).toBeNull();
    expect(result.reason).toBe('granularity');
  });

  it('resolveNativeCaptionLine uses MT cache on coarse tlang tracks', () => {
    const mt = new Map([[0, '你想真的堅持']]);
    expect(
      resolveNativeCaptionLine(learning, [nativeZhHans], {
        learningSegmentCount: trackStats.learningCount,
        cueIndex: 0,
        mtTranslations: mt,
      }),
    ).toEqual({ status: 'text', text: '你想真的堅持' });

    expect(
      resolveNativeCaptionLine(learning, [nativeZhHant], {
        learningSegmentCount: trackStats.learningCount,
        cueIndex: 0,
        mtTranslations: mt,
      }),
    ).toEqual({ status: 'text', text: '你想真的堅持' });
  });
});

describe('Jo Van Eyck coarse track', () => {
  it('detects Jo native track as coarse (48% of learning cues)', () => {
    expect(isCoarseNativeTrack(674, 324)).toBe(true);
  });
});
