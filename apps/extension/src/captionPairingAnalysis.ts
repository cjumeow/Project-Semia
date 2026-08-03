import type { TranscriptSegment } from './types';

const TIMING_TOLERANCE_SEC = 0.05;

export type PairingSample = {
  cueIndex: number;
  learningText: string;
  indexNativeText: string | null;
  timeNativeText: string | null;
  learningStart: number;
  indexNativeStart: number | null;
  timeNativeStart: number | null;
};

export type PairingStrategyStats = {
  learningCount: number;
  nativeCount: number;
  nativeAvailable: boolean;
  /** Index i paired with native i; start+duration within tolerance. */
  indexTimingPassPct: number;
  /** Learning cues with at least one overlapping native cue. */
  timeOverlapCoveragePct: number;
  /** Learning cues where multiple native cues overlap the window. */
  timeMultiMatchPct: number;
  samples: PairingSample[];
};

function segmentEnd(seg: TranscriptSegment): number {
  return seg.start + seg.duration;
}

export function overlapSeconds(
  a: TranscriptSegment,
  b: TranscriptSegment,
): number {
  const start = Math.max(a.start, b.start);
  const end = Math.min(segmentEnd(a), segmentEnd(b));
  return Math.max(0, end - start);
}

/** Pick native text by maximum time overlap; tie-break by earliest start. */
export function nativeTextByTimeOverlap(
  learning: TranscriptSegment,
  nativeSegments: TranscriptSegment[],
): { text: string | null; matchedIndices: number[] } {
  const hits: Array<{ index: number; overlap: number }> = [];
  for (let i = 0; i < nativeSegments.length; i++) {
    const overlap = overlapSeconds(learning, nativeSegments[i]);
    if (overlap > 0.01) {
      hits.push({ index: i, overlap });
    }
  }
  if (!hits.length) {
    return { text: null, matchedIndices: [] };
  }
  hits.sort((a, b) => b.overlap - a.overlap || a.index - b.index);
  const bestOverlap = hits[0].overlap;
  const best = hits.filter((h) => h.overlap === bestOverlap);
  const text = best.map((h) => nativeSegments[h.index].text).join(' ');
  return { text, matchedIndices: best.map((h) => h.index) };
}

export function analyzePairingStrategies(
  learning: TranscriptSegment[],
  native: TranscriptSegment[],
  sampleStride = 5,
): PairingStrategyStats {
  if (!native.length) {
    return {
      learningCount: learning.length,
      nativeCount: 0,
      nativeAvailable: false,
      indexTimingPassPct: 0,
      timeOverlapCoveragePct: 0,
      timeMultiMatchPct: 0,
      samples: [],
    };
  }

  let indexTimingPass = 0;
  let timeCoverage = 0;
  let timeMulti = 0;
  const samples: PairingSample[] = [];

  for (let i = 0; i < learning.length; i++) {
    const L = learning[i];
    const timeResult = nativeTextByTimeOverlap(L, native);

    if (
      native[i] &&
      Math.abs(native[i].start - L.start) <= TIMING_TOLERANCE_SEC &&
      Math.abs(native[i].duration - L.duration) <= TIMING_TOLERANCE_SEC
    ) {
      indexTimingPass++;
    }

    if (timeResult.text) {
      timeCoverage++;
      if (timeResult.matchedIndices.length > 1) {
        timeMulti++;
      }
    }

    if (i % sampleStride === 0 && samples.length < 6) {
      samples.push({
        cueIndex: i,
        learningText: L.text.slice(0, 120),
        indexNativeText: native[i]?.text?.slice(0, 120) ?? null,
        timeNativeText: timeResult.text?.slice(0, 120) ?? null,
        learningStart: L.start,
        indexNativeStart: native[i]?.start ?? null,
        timeNativeStart:
          timeResult.matchedIndices[0] != null
            ? native[timeResult.matchedIndices[0]].start
            : null,
      });
    }
  }

  const n = learning.length || 1;
  return {
    learningCount: learning.length,
    nativeCount: native.length,
    nativeAvailable: true,
    indexTimingPassPct: Math.round((100 * indexTimingPass) / n),
    timeOverlapCoveragePct: Math.round((100 * timeCoverage) / n),
    timeMultiMatchPct: Math.round((100 * timeMulti) / n),
    samples,
  };
}
