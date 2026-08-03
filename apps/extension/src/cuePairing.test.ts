import { describe, expect, it } from 'vitest';
import {
  PAIRING_MAX_START_DELTA_SEC,
  PAIRING_MIN_OVERLAP_RATIO,
  pairNativeForLearningCue,
  validateNativeTrackLength,
} from './cuePairing';

/** Jo Van Eyck j_r93YulrUE — learning cue 96 (index pairing was wrong at native[96]). */
const JO_LEARNING_96 = {
  text: 'that. That&#39;s part of context engineering',
  start: 236.08,
  duration: 4.4,
};
const JO_NATIVE_92_ALIGNED = {
  text: '等等。對我來說，這是情境工程的一部分，',
  start: 236.08,
  duration: 4.4,
};
const JO_NATIVE_96_INDEX_WRONG = {
  text: '偷來的這句話，但有人說過，軟體設計是上下文工程，因為是的，程式碼庫和所有這些工具，呃，它們可以隨意瀏覽程式碼庫，你不需要給東西起描述性的名字，你也不需要考慮模組化，但是如果你要進行',
  start: 264.56,
  duration: 3.919,
};

describe('pairNativeForLearningCue', () => {
  const learning = { text: 'hello world', start: 10, duration: 2 };

  it('returns high when overlap, timing, and length gates pass', () => {
    const result = pairNativeForLearningCue(learning, [
      { text: '你好', start: 10.1, duration: 2 },
    ]);
    expect(result.confidence).toBe('high');
    expect(result.nativeText).toBe('你好');
    expect(result.reason).toBeUndefined();
  });

  it('returns none with missing_track when native track is empty', () => {
    const result = pairNativeForLearningCue(learning, []);
    expect(result.confidence).toBe('none');
    expect(result.nativeText).toBeNull();
    expect(result.reason).toBe('missing_track');
  });

  it('returns none with no_overlap when intervals do not overlap', () => {
    const result = pairNativeForLearningCue(learning, [
      { text: '你好', start: 0, duration: 1 },
    ]);
    expect(result.confidence).toBe('none');
    expect(result.reason).toBe('no_overlap');
  });

  it('returns none with ambiguous when two natives tie on best overlap', () => {
    const result = pairNativeForLearningCue(learning, [
      { text: 'a', start: 10, duration: 2 },
      { text: 'b', start: 10, duration: 2 },
    ]);
    expect(result.confidence).toBe('none');
    expect(result.reason).toBe('ambiguous');
  });

  it('returns none with timing when start delta exceeds gate', () => {
    const result = pairNativeForLearningCue(learning, [
      {
        text: '你好',
        start: 10 + PAIRING_MAX_START_DELTA_SEC + 0.5,
        duration: 2,
      },
    ]);
    expect(result.confidence).toBe('none');
    expect(result.reason).toBe('timing');
  });

  it('returns none with no_overlap when overlap ratio is below gate', () => {
    const result = pairNativeForLearningCue(learning, [
      {
        text: 'x',
        start: 11.99,
        duration: 0.5,
      },
    ]);
    expect(result.confidence).toBe('none');
    expect(result.reason).toBe('no_overlap');
    expect(PAIRING_MIN_OVERLAP_RATIO).toBe(0.5);
  });

  it('returns none with length when native text is far longer than learning', () => {
    const result = pairNativeForLearningCue(learning, [
      {
        text: 'x'.repeat(learning.text.length * 6),
        start: 10,
        duration: 2,
      },
    ]);
    expect(result.confidence).toBe('none');
    expect(result.reason).toBe('length');
  });

  it('Jo Van Eyck cue 96 uses time overlap, not index-96 wrong native', () => {
    const result = pairNativeForLearningCue(JO_LEARNING_96, [
      JO_NATIVE_92_ALIGNED,
      JO_NATIVE_96_INDEX_WRONG,
    ]);

    expect(result.confidence).toBe('high');
    expect(result.nativeText).toBe(JO_NATIVE_92_ALIGNED.text);
    expect(result.nativeText).not.toBe(JO_NATIVE_96_INDEX_WRONG.text);
  });
});

describe('validateNativeTrackLength', () => {
  it('flags length mismatch', () => {
    expect(validateNativeTrackLength(10, 9)).toBe('length_mismatch');
  });

  it('accepts equal lengths', () => {
    expect(validateNativeTrackLength(10, 10)).toBeNull();
  });
});
