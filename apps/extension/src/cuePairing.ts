import type { TranscriptSegment } from './types';

/** Minimum interval overlap (seconds) to consider a native candidate. */
export const PAIRING_MIN_OVERLAP_SEC = 0.01;

/** Native overlap must cover at least this fraction of the learning cue duration. */
export const PAIRING_MIN_OVERLAP_RATIO = 0.5;

/** Max |native.start − learning.start| for a high-confidence pair. */
export const PAIRING_MAX_START_DELTA_SEC = 0.3;

/** Native text length must not exceed learning length × this factor. */
export const PAIRING_MAX_NATIVE_LENGTH_RATIO = 1.5;

/** Stricter length cap when the native track is structurally coarse. */
export const PAIRING_MAX_NATIVE_LENGTH_RATIO_COARSE = 1.2;

/** Native cue duration must not exceed learning duration × this factor (span mismatch). */
export const PAIRING_MAX_NATIVE_DURATION_RATIO = 2.5;

/** Native cue count below learning × this ratio is a coarse merged track. */
export const COARSE_NATIVE_TRACK_RATIO = 0.7;

const SENTENCE_TERMINATORS = /[.!?。！？]/g;

export type PairingConfidence = 'high' | 'none';

export type PairingReason =
  | 'missing_track'
  | 'no_overlap'
  | 'ambiguous'
  | 'timing'
  | 'length'
  | 'span'
  | 'granularity';

export type PairedNativeCue = {
  nativeText: string | null;
  confidence: PairingConfidence;
  reason?: PairingReason;
};

export type CuePairWarning = 'missing_native' | 'timing_mismatch' | 'length_mismatch';

export type PairNativeOptions = {
  /** Apply stricter gates when native track has far fewer cues than learning. */
  coarseNativeTrack?: boolean;
};

function segmentEnd(seg: TranscriptSegment): number {
  return seg.start + seg.duration;
}

export function countSentenceTerminators(text: string): number {
  return (text.match(SENTENCE_TERMINATORS) ?? []).length;
}

/** True when YouTube tlang merged many learning cues into fewer native cues. */
export function isCoarseNativeTrack(
  learningCount: number,
  nativeCount: number,
): boolean {
  if (learningCount <= 0 || nativeCount <= 0) return false;
  return nativeCount < learningCount * COARSE_NATIVE_TRACK_RATIO;
}

function maxNativeLengthRatio(coarseNativeTrack: boolean): number {
  return coarseNativeTrack
    ? PAIRING_MAX_NATIVE_LENGTH_RATIO_COARSE
    : PAIRING_MAX_NATIVE_LENGTH_RATIO;
}

function failsGranularityGate(
  learning: TranscriptSegment,
  native: TranscriptSegment,
): boolean {
  const nativeSentences = countSentenceTerminators(native.text);
  const learningSentences = countSentenceTerminators(learning.text);

  if (nativeSentences >= 2 && native.text.length > learning.text.length) {
    return true;
  }

  return (
    nativeSentences > learningSentences + 1 &&
    native.text.length > learning.text.length * 1.05
  );
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
  options?: PairNativeOptions,
): PairedNativeCue {
  if (!nativeSegments?.length) {
    return {
      nativeText: null,
      confidence: 'none',
      reason: 'missing_track',
    };
  }

  const coarseNativeTrack = options?.coarseNativeTrack === true;
  const lengthRatioLimit = maxNativeLengthRatio(coarseNativeTrack);

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

  if (failsGranularityGate(learning, native)) {
    return { nativeText: null, confidence: 'none', reason: 'granularity' };
  }

  if (native.text.length > lengthRatioLimit * learning.text.length) {
    return { nativeText: null, confidence: 'none', reason: 'length' };
  }

  if (
    native.duration >
    PAIRING_MAX_NATIVE_DURATION_RATIO * learning.duration
  ) {
    return { nativeText: null, confidence: 'none', reason: 'span' };
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
