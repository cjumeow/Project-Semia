export type FocusValidationInput = {
  dynamicContextBlock?: string;
  selectedText: string;
  originalSpeech: string;
  naturalTranslation: string;
};

/** Flatten bilingual blocks and whitespace for substring matching. */
export function flattenCorpusText(text: string): string {
  return text
    .split(/\s*---\s*/)
    .join('\n')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Match focus in corpus. Multi-word phrases use substring match.
 * Single tokens require word boundaries (reject "tractab" inside "tractable").
 */
export function isFocusTextInCorpus(focusText: string, corpus: string): boolean {
  const focus = focusText.trim().replace(/\s+/g, ' ');
  if (!focus) {
    return false;
  }

  const flat = flattenCorpusText(corpus);
  const normalized = focus.toLowerCase();

  if (/\s/.test(focus)) {
    return flat.includes(normalized);
  }

  const pattern = new RegExp(
    `(?:^|[^\\p{L}\\p{N}])${escapeRegExp(normalized)}(?:[^\\p{L}\\p{N}]|$)`,
    'iu',
  );
  return pattern.test(flat);
}

/** Corpus for focus validation: context window first, else capture text (A2). */
export function buildFocusValidationCorpus(input: FocusValidationInput): string {
  const contextWindow = input.dynamicContextBlock?.trim();
  if (contextWindow) {
    return contextWindow;
  }

  return [
    input.selectedText,
    input.originalSpeech,
    input.naturalTranslation,
  ]
    .map((part) => part.trim())
    .filter(Boolean)
    .join('\n');
}

export function validateFocusText(
  focusText: string,
  input: FocusValidationInput,
): void {
  const corpus = buildFocusValidationCorpus(input);
  if (!isFocusTextInCorpus(focusText, corpus)) {
    throw new Error(
      'Focus text must appear as a complete word or phrase in the context window (or capture text when context window is unavailable).',
    );
  }
}

/** B3: focus covers the whole capture → meaning comes from snip note translation. */
export function isWholeCaptureFocus(
  focusText: string,
  input: Pick<FocusValidationInput, 'selectedText' | 'originalSpeech'>,
): boolean {
  const focus = focusText.trim().toLowerCase();
  if (!focus) {
    return false;
  }

  const candidates = [input.selectedText, input.originalSpeech]
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);

  return candidates.some((candidate) => candidate === focus);
}
