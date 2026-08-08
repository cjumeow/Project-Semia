export const SUGGESTION_EXCERPT_MAX_CHARS = 300;

const SENTENCE_END_RE = /[.!?。！？]/;

export type BuildSuggestionContextExcerptInput = {
  originalSpeech: string;
  focusText: string;
  captureText?: string;
  maxChars?: number;
};

type SentenceSpan = {
  start: number;
  end: number;
};

function sentenceSpans(text: string): SentenceSpan[] {
  const spans: SentenceSpan[] = [];
  let start = 0;

  for (let index = 0; index < text.length; index++) {
    if (!SENTENCE_END_RE.test(text[index]!)) {
      continue;
    }

    let end = index + 1;
    while (end < text.length && /\s/.test(text[end]!)) {
      end++;
    }

    spans.push({ start, end: index + 1 });
    start = end;
    index = end - 1;
  }

  if (start < text.length) {
    spans.push({ start, end: text.length });
  }

  return spans;
}

function findSpanIndex(spans: SentenceSpan[], position: number): number {
  for (let index = 0; index < spans.length; index++) {
    const span = spans[index]!;
    if (position >= span.start && position < span.end) {
      return index;
    }
  }
  return -1;
}

function excerptFromSpeech(
  speech: string,
  focusText: string,
  maxChars: number,
): string | null {
  const trimmedFocus = focusText.trim();
  if (!trimmedFocus) {
    return null;
  }

  const matchIndex = speech.toLowerCase().indexOf(trimmedFocus.toLowerCase());
  if (matchIndex < 0) {
    return null;
  }

  const spans = sentenceSpans(speech);
  if (spans.length === 0) {
    return capAroundIndex(speech, matchIndex, maxChars);
  }

  const spanIndex = findSpanIndex(spans, matchIndex);
  if (spanIndex < 0) {
    return capAroundIndex(speech, matchIndex, maxChars);
  }

  const from = Math.max(0, spanIndex - 1);
  const to = Math.min(spans.length - 1, spanIndex + 1);
  const excerpt = speech.slice(spans[from]!.start, spans[to]!.end).trim();
  if (excerpt.length <= maxChars) {
    return excerpt;
  }

  return capAroundIndex(excerpt, excerpt.toLowerCase().indexOf(trimmedFocus.toLowerCase()), maxChars);
}

function capAroundIndex(text: string, focusIndex: number, maxChars: number): string {
  if (text.length <= maxChars) {
    return text;
  }

  const safeFocus = Math.max(0, Math.min(focusIndex, text.length - 1));
  const half = Math.floor(maxChars / 2);
  let start = Math.max(0, safeFocus - half);
  let end = start + maxChars;
  if (end > text.length) {
    end = text.length;
    start = Math.max(0, end - maxChars);
  }

  return text.slice(start, end).trim();
}

function capHead(text: string, maxChars: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxChars) {
    return trimmed;
  }
  return trimmed.slice(0, maxChars);
}

/**
 * Builds a short excerpt of `originalSpeech` around `focusText` for AI suggestion prompts.
 *
 * Locates focus (case-insensitive), expands to the containing sentence plus one adjacent
 * sentence on each side, then hard-caps at {@link SUGGESTION_EXCERPT_MAX_CHARS} characters.
 * When focus is not found in speech, falls back to `captureText` or the head of speech.
 */
export function buildSuggestionContextExcerpt({
  originalSpeech,
  focusText,
  captureText,
  maxChars = SUGGESTION_EXCERPT_MAX_CHARS,
}: BuildSuggestionContextExcerptInput): string {
  const speech = originalSpeech.trim();
  const capture = captureText?.trim() ?? '';

  if (!speech) {
    return capHead(capture, maxChars);
  }

  const fromSpeech = excerptFromSpeech(speech, focusText, maxChars);
  if (fromSpeech) {
    return fromSpeech;
  }

  if (capture) {
    return capHead(capture, maxChars);
  }

  return capHead(speech, maxChars);
}
