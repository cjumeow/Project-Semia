import type { FlatText } from './flattenText';

const CONTEXT_RADIUS = 1500;

const SENTENCE_END_SOURCE = '[.!?。！？]\\s+';

type Boundary = { index: number; length: number };

function firstSentenceEnd(text: string): Boundary | null {
  const match = new RegExp(SENTENCE_END_SOURCE).exec(text);
  return match ? { index: match.index, length: match[0].length } : null;
}

function lastSentenceEnd(text: string): Boundary | null {
  const pattern = new RegExp(SENTENCE_END_SOURCE, 'g');
  let last: Boundary | null = null;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    last = { index: match.index, length: match[0].length };
  }

  return last;
}

/**
 * Extract surrounding article text around a flat-text selection, snapped to
 * sentence boundaries. Boundaries are only applied when they keep the selection
 * itself inside the returned context.
 */
export function extractContext(
  flat: FlatText,
  start: number,
  end: number,
): string {
  const windowStart = Math.max(0, start - CONTEXT_RADIUS);
  const windowEnd = Math.min(flat.text.length, end + CONTEXT_RADIUS);
  const slice = flat.text.slice(windowStart, windowEnd);

  const selectionStart = start - windowStart;
  const selectionEnd = end - windowStart;

  let from = 0;
  if (windowStart > 0) {
    const boundary = firstSentenceEnd(slice);
    if (boundary) {
      const cut = boundary.index + boundary.length;
      if (cut <= selectionStart) from = cut;
    }
  }

  let to = slice.length;
  if (windowEnd < flat.text.length) {
    const boundary = lastSentenceEnd(slice);
    if (boundary) {
      const cut = boundary.index + boundary.length;
      if (cut >= selectionEnd) to = cut;
    }
  }

  return slice.slice(from, to).trim();
}
