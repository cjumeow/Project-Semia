import { describe, expect, it } from 'vitest';
import {
  nativeTextForCue,
  validateNativeTrackLength,
} from './cuePairing';

describe('nativeTextForCue', () => {
  const learning = { text: 'hello', start: 1.0, duration: 2.0 };

  it('returns native text when timing matches', () => {
    const result = nativeTextForCue(0, learning, [
      { text: '你好', start: 1.0, duration: 2.0 },
    ]);
    expect(result.text).toBe('你好');
    expect(result.warning).toBeUndefined();
  });

  it('returns text with timing_mismatch when start differs', () => {
    const result = nativeTextForCue(0, learning, [
      { text: '你好', start: 1.2, duration: 2.0 },
    ]);
    expect(result.text).toBe('你好');
    expect(result.warning).toBe('timing_mismatch');
  });

  it('returns missing_native when index absent', () => {
    const result = nativeTextForCue(1, learning, [
      { text: '你好', start: 1.0, duration: 2.0 },
    ]);
    expect(result.text).toBeNull();
    expect(result.warning).toBe('missing_native');
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
