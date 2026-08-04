import type { TranscriptSegment } from '@semia/shared';

function hasCueText(segments: TranscriptSegment[], index: number): boolean {
  return Boolean(segments[index]?.text.trim());
}

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

/**
 * LingoPanel context window: center ± N readable cues, skipping blank-text
 * segments (common on srv3/XML tracks) and expanding outward to fill the view.
 */
export function getSidebarContextCueIndices(
  segments: TranscriptSegment[],
  centerIndex: number,
  before = 2,
  after = 2,
): number[] {
  if (segments.length === 0) return [];
  if (centerIndex < 0 || centerIndex >= segments.length) return [];

  let center = centerIndex;
  if (!hasCueText(segments, center)) {
    let replacement = -1;
    for (let delta = 1; delta < segments.length; delta++) {
      if (hasCueText(segments, center - delta)) {
        replacement = center - delta;
        break;
      }
      if (hasCueText(segments, center + delta)) {
        replacement = center + delta;
        break;
      }
    }
    if (replacement < 0) return [];
    center = replacement;
  }

  const targetCount = before + after + 1;
  const picked = new Set<number>([center]);
  let needBefore = before;
  let needAfter = after;
  let lo = center - 1;
  let hi = center + 1;

  while (needBefore > 0 && lo >= 0) {
    if (hasCueText(segments, lo)) {
      picked.add(lo);
      needBefore--;
    }
    lo--;
  }

  while (needAfter > 0 && hi < segments.length) {
    if (hasCueText(segments, hi)) {
      picked.add(hi);
      needAfter--;
    }
    hi++;
  }

  while (picked.size < targetCount && (lo >= 0 || hi < segments.length)) {
    let expanded = false;
    while (lo >= 0 && picked.size < targetCount) {
      if (hasCueText(segments, lo)) {
        picked.add(lo);
        expanded = true;
      }
      lo--;
      if (expanded) break;
    }
    while (hi < segments.length && picked.size < targetCount) {
      if (hasCueText(segments, hi)) {
        picked.add(hi);
        expanded = true;
      }
      hi++;
      if (expanded) break;
    }
    if (!expanded) break;
  }

  return [...picked].sort((a, b) => a - b);
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
