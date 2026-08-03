import {
  isCoarseNativeTrack,
  pairNativeForLearningCue,
} from './cuePairing';
import type { TranscriptSegment } from './types';

export type ResolveNativeCaptionLineOptions = {
  nativeLineSuppressed?: boolean;
  learningSegmentCount?: number;
};

/** Native caption line for overlay when pairing confidence is high. */
export function resolveNativeCaptionLine(
  learning: TranscriptSegment,
  nativeSegments: TranscriptSegment[] | undefined,
  options?: ResolveNativeCaptionLineOptions,
): string | null {
  if (options?.nativeLineSuppressed) {
    return null;
  }

  if (!nativeSegments?.length) {
    return null;
  }

  if (
    options?.learningSegmentCount !== undefined &&
    isCoarseNativeTrack(options.learningSegmentCount, nativeSegments.length)
  ) {
    return null;
  }

  const paired = pairNativeForLearningCue(learning, nativeSegments);
  if (paired.confidence !== 'high' || !paired.nativeText) {
    return null;
  }

  return paired.nativeText;
}
