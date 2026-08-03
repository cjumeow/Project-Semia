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

  it('resolveNativeCaptionLine shows zh-Hans but hides zh-Hant', () => {
    expect(
      resolveNativeCaptionLine(learning, [nativeZhHans], {
        learningSegmentCount: trackStats.learningCount,
      }),
    ).toBe(nativeZhHans.text);

    expect(
      resolveNativeCaptionLine(learning, [nativeZhHant], {
        learningSegmentCount: trackStats.learningCount,
      }),
    ).toBeNull();
  });
});

describe('Jo Van Eyck coarse track', () => {
  it('detects Jo native track as coarse (48% of learning cues)', () => {
    expect(isCoarseNativeTrack(674, 324)).toBe(true);
  });
});
