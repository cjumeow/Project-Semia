import type { CueToken } from './segmenter';
import type { SelectionRange, TranscriptSegment, WordRef } from './types';

export type SelectionPhase = 'idle' | 'awaiting-end' | 'complete';

export type SelectionState =
  | { phase: 'idle' }
  | { phase: 'awaiting-end'; start: WordRef }
  | { phase: 'complete'; range: SelectionRange };

// if return value is positive, a is greater than b (b, a)
function compareWordRef(a: WordRef, b: WordRef): number {
  if (a.cueIndex !== b.cueIndex) return a.cueIndex - b.cueIndex;
  return a.wordIndex - b.wordIndex;
}

export function normalizeRange(a: WordRef, b: WordRef): SelectionRange {
  return compareWordRef(a, b) <= 0
    ? { start: a, end: b }
    : { start: b, end: a };
}

export function isWordInRange(word: WordRef, range: SelectionRange): boolean {
  return (
    compareWordRef(word, range.start) >= 0 &&
    compareWordRef(word, range.end) <= 0
  );
}

export function wordRefsEqual(a: WordRef, b: WordRef): boolean {
  return a.cueIndex === b.cueIndex && a.wordIndex === b.wordIndex;
}

/**
 * Advance two-click selection state.
 * - idle: first click sets start
 * - awaiting-end: second click completes range
 * - complete: another click starts a new selection
 */
export function applyWordClick(
  state: SelectionState,
  word: WordRef,
): SelectionState {
  if (state.phase === 'idle') {
    return { phase: 'awaiting-end', start: word };
  }

  if (state.phase === 'awaiting-end') {
    return {
      phase: 'complete',
      range: normalizeRange(state.start, word),
    };
  }

  // complete → restart with new start
  return { phase: 'awaiting-end', start: word };
}

export function clearSelection(): SelectionState {
  return { phase: 'idle' };
}

/**
 * Build selected text from tokenized cues across a word range.
 * Includes intervening punctuation / whitespace between the clicked words.
 *
 * Example: Hello(w0) + "," + " " + world(w1) → "Hello, world"
 */
export function extractSelectedText(
  tokensByCue: CueToken[][],
  range: SelectionRange,
): string {
  const parts: string[] = [];

  for (
    let cueIndex = range.start.cueIndex;
    cueIndex <= range.end.cueIndex;
    cueIndex++
  ) {
    const tokens = tokensByCue[cueIndex] ?? [];
    const wordIndices = tokens
      .filter((t): t is CueToken & { isWord: true } => t.isWord)
      .map((t) => t.wordIndex);
    if (wordIndices.length === 0) continue;

    const from =
      cueIndex === range.start.cueIndex ? range.start.wordIndex : wordIndices[0]!;
    const to =
      cueIndex === range.end.cueIndex
        ? range.end.wordIndex
        : wordIndices[wordIndices.length - 1]!;

    const slice = extractFromCueTokens(tokens, from, to);
    if (slice) parts.push(slice);
  }

  // Separate cues with a space when joining across cue boundaries.
  return parts.join(' ');
}

/**
 * Slice token text from the first wordIndex `from` through `to` (inclusive),
 * keeping punctuation / whitespace that sits between those words.
 */
function extractFromCueTokens(
  tokens: CueToken[],
  from: number,
  to: number,
): string {
  let startTok = -1;
  let endTok = -1;

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]!;
    if (!t.isWord) continue;
    if (t.wordIndex >= from && startTok === -1) startTok = i;
    if (t.wordIndex <= to) endTok = i;
  }

  if (startTok === -1 || endTok === -1 || endTok < startTok) return '';
  return tokens
    .slice(startTok, endTok + 1)
    .map((t) => t.text)
    .join('');
}

/**
 * Time bounds covering the cues touched by the selection.
 */
export function selectionTimeBounds(
  segments: TranscriptSegment[],
  range: SelectionRange,
): { start: number; end: number } {
  const first = segments[range.start.cueIndex];
  const last = segments[range.end.cueIndex];
  if (!first || !last) {
    return { start: 0, end: 0 };
  }
  return {
    start: first.start,
    end: last.start + last.duration,
  };
}
