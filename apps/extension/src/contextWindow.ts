import type { TranscriptSegment } from '@semia/shared';

/**
 * Context window around a center cue: ideally center ± 2.
 * Used by LingoPanel UI during capture (compact view).
 */
export function getContextCueIndices(
  centerIndex: number,
  totalCues: number,
  before = 2,
  after = 2,
): number[] {
  if (totalCues <= 0) return [];
  if (centerIndex < 0 || centerIndex >= totalCues) return [];

  const start = Math.max(0, centerIndex - before);
  const end = Math.min(totalCues - 1, centerIndex + after);
  const indices: number[] = [];
  for (let i = start; i <= end; i++) {
    indices.push(i);
  }
  return indices;
}

export type ContextCueWindow = {
  cues: TranscriptSegment[];
  indices: [number, number];
};

/**
 * All transcript cues overlapping [centerTime - radius, centerTime + radius].
 * Default radius 15s → ~30s window for AI context on saved fragments.
 */
export function getContextCuesByTimeRange(
  segments: TranscriptSegment[],
  centerTime: number,
  radiusSeconds = 15,
): ContextCueWindow {
  if (segments.length === 0) {
    return { cues: [], indices: [0, 0] };
  }

  const windowStart = Math.max(0, centerTime - radiusSeconds);
  const windowEnd = centerTime + radiusSeconds;
  const indices: number[] = [];

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]!;
    const segmentEnd = segment.start + segment.duration;
    if (segmentEnd > windowStart && segment.start < windowEnd) {
      indices.push(i);
    }
  }

  if (indices.length === 0) {
    return { cues: [], indices: [0, 0] };
  }

  return {
    cues: indices.map((index) => segments[index]!),
    indices: [indices[0]!, indices[indices.length - 1]!],
  };
}
