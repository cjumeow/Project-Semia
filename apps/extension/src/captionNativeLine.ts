import { pairNativeForLearningCue } from './cuePairing';
import type { TranscriptSegment } from './types';

/** Native caption line for overlay when pairing confidence is high. */
export function resolveNativeCaptionLine(
  learning: TranscriptSegment,
  nativeSegments: TranscriptSegment[] | undefined,
): string | null {
  if (!nativeSegments?.length) {
    return null;
  }

  const paired = pairNativeForLearningCue(learning, nativeSegments);
  if (paired.confidence !== 'high' || !paired.nativeText) {
    return null;
  }

  return paired.nativeText;
}
