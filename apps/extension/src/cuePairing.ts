import type { TranscriptSegment } from './types';

/** Minimum interval overlap (seconds) to consider a native candidate. */
export const PAIRING_MIN_OVERLAP_SEC = 0.01;

/** Native overlap must cover at least this fraction of the learning cue duration. */
export const PAIRING_MIN_OVERLAP_RATIO = 0.5;

/** Max |native.start − learning.start| for a high-confidence pair. */
export const PAIRING_MAX_START_DELTA_SEC = 0.3;

/** Native text length must not exceed learning length × this factor. */
export const PAIRING_MAX_NATIVE_LENGTH_RATIO = 5;

export type PairingConfidence = 'high' | 'none';

export type PairingReason =
  | 'missing_track'
  | 'no_overlap'
  | 'ambiguous'
  | 'timing'
  | 'length';

export type PairedNativeCue = {
  nativeText: string | null;
  confidence: PairingConfidence;
  reason?: PairingReason;
};

export type CuePairWarning = 'missing_native' | 'timing_mismatch' | 'length_mismatch';

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

export function pairNativeForLearningCue(
  learning: TranscriptSegment,
  nativeSegments: TranscriptSegment[] | undefined,
): PairedNativeCue {
  if (!nativeSegments?.length) {
    return {
      nativeText: null,
      confidence: 'none',
      reason: 'missing_track',
    };
  }

  const hits: Array<{ index: number; overlap: number }> = [];
  for (let i = 0; i < nativeSegments.length; i++) {
    const overlap = overlapSeconds(learning, nativeSegments[i]);
    if (overlap > PAIRING_MIN_OVERLAP_SEC) {
      hits.push({ index: i, overlap });
    }
  }

  if (!hits.length) {
    return { nativeText: null, confidence: 'none', reason: 'no_overlap' };
  }

  hits.sort((a, b) => b.overlap - a.overlap || a.index - b.index);
  const bestOverlap = hits[0]!.overlap;
  const bestHits = hits.filter((h) => h.overlap === bestOverlap);
  if (bestHits.length > 1) {
    return { nativeText: null, confidence: 'none', reason: 'ambiguous' };
  }

  const native = nativeSegments[bestHits[0]!.index]!;

  if (bestOverlap < PAIRING_MIN_OVERLAP_RATIO * learning.duration) {
    return { nativeText: null, confidence: 'none', reason: 'no_overlap' };
  }

  if (
    Math.abs(native.start - learning.start) > PAIRING_MAX_START_DELTA_SEC
  ) {
    return { nativeText: null, confidence: 'none', reason: 'timing' };
  }

  if (
    native.text.length >
    PAIRING_MAX_NATIVE_LENGTH_RATIO * learning.text.length
  ) {
    return { nativeText: null, confidence: 'none', reason: 'length' };
  }

  return { nativeText: native.text, confidence: 'high' };
}

export function validateNativeTrackLength(
  learningCount: number,
  nativeCount: number,
): CuePairWarning | null {
  if (nativeCount === 0) return 'missing_native';
  if (nativeCount !== learningCount) return 'length_mismatch';
  return null;
}
