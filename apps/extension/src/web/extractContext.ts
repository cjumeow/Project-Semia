import type { FlatText } from './flattenText';

const CONTEXT_RADIUS = 1500;

const SENTENCE_END = /[.!?。！？]\s+/;

function trimToSentenceStart(text: string, atStart: boolean): string {
  if (atStart) return text;
  const match = text.match(SENTENCE_END);
  if (!match || match.index === undefined) return text;
  return text.slice(match.index + match[0].length);
}

function trimToSentenceEnd(text: string, atEnd: boolean): string {
  if (atEnd) return text;
  const matches = [...text.matchAll(SENTENCE_END)];
  if (matches.length === 0) return text;
  const last = matches[matches.length - 1]!;
  return text.slice(0, last.index! + last[0].length);
}

/** Extract surrounding article text around a flat-text selection. */
export function extractContext(
  flat: FlatText,
  start: number,
  end: number,
): string {
  const rawStart = Math.max(0, start - CONTEXT_RADIUS);
  const rawEnd = Math.min(flat.text.length, end + CONTEXT_RADIUS);
  let context = flat.text.slice(rawStart, rawEnd);
  context = trimToSentenceStart(context, rawStart === 0);
  context = trimToSentenceEnd(context, rawEnd === flat.text.length);
  return context.trim();
}
