/**
 * Context window around a center cue: ideally center ± 2.
 * Does NOT pad toward the other side when near start/end.
 *
 * Examples (100 cues, center marked with &):
 *   0 → [0, 1, 2]
 *   1 → [0, 1, 2, 3]
 *   2 → [0, 1, 2, 3, 4]
 *   3 → [1, 2, 3, 4, 5]
 *  98 → [96, 97, 98, 99]
 *  99 → [97, 98, 99]
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
