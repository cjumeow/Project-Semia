import {
  isCoarseNativeTrack,
  pairNativeForLearningCue,
} from './cuePairing';
import { NATIVE_LINE_LOADING_TEXT } from './mtNativePrewarm';
import type { TranscriptSegment } from './types';

export type NativeLineResult =
  | { status: 'text'; text: string }
  | { status: 'loading' }
  | { status: 'none' };

export type ResolveNativeCaptionLineOptions = {
  nativeLineSuppressed?: boolean;
  learningSegmentCount?: number;
  cueIndex?: number;
  mtTranslations?: ReadonlyMap<number, string>;
  mtPrewarmActive?: boolean;
  /** When true, skip tlang pairing (coarse or unreliable track → MT only). */
  skipTlangPairing?: boolean;
};

export { NATIVE_LINE_LOADING_TEXT };

/** Native caption line for overlay — tlang pairing or MT cache on coarse tracks. */
export function resolveNativeCaptionLine(
  learning: TranscriptSegment,
  nativeSegments: TranscriptSegment[] | undefined,
  options?: ResolveNativeCaptionLineOptions,
): NativeLineResult {
  if (options?.nativeLineSuppressed) {
    return { status: 'none' };
  }

  const learningCount = options?.learningSegmentCount;
  const nativeCount = nativeSegments?.length ?? 0;
  const coarse =
    learningCount !== undefined &&
    nativeCount > 0 &&
    isCoarseNativeTrack(learningCount, nativeCount);

  if (
    !options?.skipTlangPairing &&
    !coarse &&
    nativeSegments?.length
  ) {
    const paired = pairNativeForLearningCue(learning, nativeSegments);
    if (paired.confidence === 'high' && paired.nativeText) {
      return { status: 'text', text: paired.nativeText };
    }
  }

  if (options?.mtPrewarmActive) {
    return { status: 'loading' };
  }

  const cueIndex = options?.cueIndex;
  if (cueIndex !== undefined && options?.mtTranslations) {
    const mtText = options.mtTranslations.get(cueIndex);
    if (mtText?.trim()) {
      return { status: 'text', text: mtText };
    }
  }

  return { status: 'none' };
}
