import type { TranscriptSegment } from '@semia/shared';
import { describe, expect, it } from 'vitest';
import { getContextCueIndices, getContextCuesByTimeRange } from './contextWindow';

/** 12 cues of 5s each: cue i covers [i*5, i*5+5). */
function makeSegments(count = 12): TranscriptSegment[] {
  return Array.from({ length: count }, (_, i) => ({
    text: `cue ${i}`,
    start: i * 5,
    duration: 5,
  }));
}

describe('getContextCueIndices', () => {
  it('returns the center cue plus two on each side', () => {
    expect(getContextCueIndices(5, 12)).toEqual([3, 4, 5, 6, 7]);
  });

  it('clamps at the start of the transcript', () => {
    expect(getContextCueIndices(0, 12)).toEqual([0, 1, 2]);
  });

  it('clamps at the end of the transcript', () => {
    expect(getContextCueIndices(11, 12)).toEqual([9, 10, 11]);
  });

  it('returns nothing when the center is out of range', () => {
    expect(getContextCueIndices(-1, 12)).toEqual([]);
    expect(getContextCueIndices(12, 12)).toEqual([]);
    expect(getContextCueIndices(0, 0)).toEqual([]);
  });
});

describe('getContextCuesByTimeRange', () => {
  it('collects every cue overlapping a 30s window by default', () => {
    const { cues, indices } = getContextCuesByTimeRange(makeSegments(), 30);

    // 15s radius → [15, 45); cue 3 starts at 15, cue 8 ends at 45.
    expect(indices).toEqual([3, 8]);
    expect(cues.map((c) => c.text)).toEqual([
      'cue 3',
      'cue 4',
      'cue 5',
      'cue 6',
      'cue 7',
      'cue 8',
    ]);
  });

  it('clamps the window at zero instead of going negative', () => {
    const { indices } = getContextCuesByTimeRange(makeSegments(), 5);

    expect(indices).toEqual([0, 3]);
  });

  it('honours a custom radius', () => {
    const { indices } = getContextCuesByTimeRange(makeSegments(), 30, 5);

    expect(indices).toEqual([5, 6]);
  });

  it('returns an empty window when no cue overlaps', () => {
    expect(getContextCuesByTimeRange(makeSegments(), 1000)).toEqual({
      cues: [],
      indices: [0, 0],
    });
  });

  it('returns an empty window for an empty transcript', () => {
    expect(getContextCuesByTimeRange([], 30)).toEqual({
      cues: [],
      indices: [0, 0],
    });
  });
});
