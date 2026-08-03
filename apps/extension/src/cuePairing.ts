import type { TranscriptSegment } from './types';

const TIMING_TOLERANCE_SEC = 0.05;

export type CuePairWarning = 'missing_native' | 'timing_mismatch' | 'length_mismatch';

export function nativeTextForCue(
  cueIndex: number,
  learningSegment: TranscriptSegment,
  nativeSegments: TranscriptSegment[] | undefined,
): { text: string | null; warning?: CuePairWarning } {
  if (!nativeSegments?.length) {
    return { text: null, warning: 'missing_native' };
  }

  const native = nativeSegments[cueIndex];
  if (!native) {
    return { text: null, warning: 'missing_native' };
  }

  const startDelta = Math.abs(native.start - learningSegment.start);
  const durationDelta = Math.abs(native.duration - learningSegment.duration);
  if (startDelta > TIMING_TOLERANCE_SEC || durationDelta > TIMING_TOLERANCE_SEC) {
    return { text: native.text, warning: 'timing_mismatch' };
  }

  return { text: native.text };
}

export function validateNativeTrackLength(
  learningCount: number,
  nativeCount: number,
): CuePairWarning | null {
  if (nativeCount === 0) return 'missing_native';
  if (nativeCount !== learningCount) return 'length_mismatch';
  return null;
}
