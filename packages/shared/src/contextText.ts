import type { TranscriptSegment } from './types';

/** Flatten timed cues into one context string for AI and UI. */
export function contextCuesToText(cues: TranscriptSegment[]): string {
  return cues
    .map((cue) => cue.text.trim())
    .filter(Boolean)
    .join(' ');
}
