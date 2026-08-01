export type HighlightTextSegment = {
  text: string;
  highlighted: boolean;
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Find the captured selection inside a context paragraph. Tries exact match,
 * then case-insensitive, then flexible whitespace (ASR / punctuation drift).
 */
export function findSelectionRange(
  text: string,
  selection: string,
): { start: number; end: number } | null {
  const needle = selection.trim();
  if (!needle || !text) return null;

  const direct = text.indexOf(needle);
  if (direct >= 0) {
    return { start: direct, end: direct + needle.length };
  }

  const lowerText = text.toLowerCase();
  const lowerNeedle = needle.toLowerCase();
  const caseInsensitive = lowerText.indexOf(lowerNeedle);
  if (caseInsensitive >= 0) {
    return {
      start: caseInsensitive,
      end: caseInsensitive + needle.length,
    };
  }

  const pattern = escapeRegExp(needle).replace(/\s+/g, '\\s+');
  const match = new RegExp(pattern, 'i').exec(text);
  if (!match) return null;

  return { start: match.index, end: match.index + match[0].length };
}

export function splitTextBySelection(
  text: string,
  selection: string,
): HighlightTextSegment[] {
  const range = findSelectionRange(text, selection);
  if (!range) {
    return [{ text, highlighted: false }];
  }

  const segments: HighlightTextSegment[] = [];
  if (range.start > 0) {
    segments.push({ text: text.slice(0, range.start), highlighted: false });
  }
  segments.push({
    text: text.slice(range.start, range.end),
    highlighted: true,
  });
  if (range.end < text.length) {
    segments.push({ text: text.slice(range.end), highlighted: false });
  }

  return segments;
}
