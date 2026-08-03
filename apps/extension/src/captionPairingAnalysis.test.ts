import { describe, expect, it } from 'vitest';
import { overlapSeconds } from './cuePairing';
import {
  analyzePairingStrategies,
  nativeTextByTimeOverlap,
} from './captionPairingAnalysis';

describe('overlapSeconds', () => {
  it('returns shared interval length', () => {
    const a = { text: 'a', start: 1, duration: 2 };
    const b = { text: 'b', start: 2, duration: 2 };
    expect(overlapSeconds(a, b)).toBe(1);
  });
});

describe('nativeTextByTimeOverlap', () => {
  it('picks native cue with best overlap', () => {
    const learning = { text: 'hello', start: 10, duration: 2 };
    const native = [
      { text: 'wrong', start: 0, duration: 1 },
      { text: '你好', start: 10.5, duration: 1.5 },
    ];
    const result = nativeTextByTimeOverlap(learning, native);
    expect(result.text).toBe('你好');
  });
});

describe('analyzePairingStrategies', () => {
  it('reports 100% index timing when tracks are aligned', () => {
    const track = [
      { text: 'one', start: 0, duration: 1 },
      { text: 'two', start: 1, duration: 1 },
    ];
    const stats = analyzePairingStrategies(track, track, 1);
    expect(stats.indexTimingPassPct).toBe(100);
    expect(stats.timeOverlapCoveragePct).toBe(100);
  });

  it('reports missing native when native track empty', () => {
    const learning = [{ text: 'one', start: 0, duration: 1 }];
    const stats = analyzePairingStrategies(learning, []);
    expect(stats.nativeAvailable).toBe(false);
  });
});
