/**
 * A single Intl.Segmenter piece of cue text.
 * Only `isWord` tokens are clickable; punctuation / whitespace are kept for display.
 */
export type CueToken =
  | { text: string; isWord: true; wordIndex: number }
  | { text: string; isWord: false; wordIndex?: undefined };

/**
 * Tokenize cue text via Intl.Segmenter, keeping whitespace & punctuation.
 * Word-like segments get a dense `wordIndex` (0, 1, 2, …); others do not.
 *
 * Example:
 *   "Hello, world!" →
 *   [Hello(w0), ",", " ", world(w1), "!"]
 */
export function tokenizeCue(text: string, languageCode = 'en'): CueToken[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter(languageCode || 'en', {
      granularity: 'word',
    });
    const tokens: CueToken[] = [];
    let wordIndex = 0;
    for (const { segment, isWordLike } of segmenter.segment(trimmed)) {
      if (isWordLike) {
        tokens.push({ text: segment, isWord: true, wordIndex: wordIndex++ });
      } else {
        tokens.push({ text: segment, isWord: false });
      }
    }
    if (tokens.length > 0) return tokens;
  }

  return fallbackTokenize(trimmed);
}

/** Last-resort tokenizer when Intl.Segmenter is unavailable. */
function fallbackTokenize(text: string): CueToken[] {
  const tokens: CueToken[] = [];
  let wordIndex = 0;
  // Keep separators (spaces / punctuation) as their own tokens.
  const parts = text.split(/(\s+|[^\p{L}\p{N}']+)/u);
  for (const part of parts) {
    if (!part) continue;
    if (/^\s+$/.test(part) || /^[^\p{L}\p{N}']+$/u.test(part)) {
      tokens.push({ text: part, isWord: false });
    } else {
      tokens.push({ text: part, isWord: true, wordIndex: wordIndex++ });
    }
  }
  return tokens;
}

/** Look up the display text for a clickable wordIndex. */
export function getWordText(
  tokens: CueToken[],
  wordIndex: number,
): string | undefined {
  const hit = tokens.find((t) => t.isWord && t.wordIndex === wordIndex);
  return hit?.text;
}
