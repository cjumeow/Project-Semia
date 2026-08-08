export function focusAppearsInSpeech(
  focusText: string,
  originalSpeech: string,
): boolean {
  const focus = focusText.trim();
  if (!focus) {
    return false;
  }

  return originalSpeech.toLowerCase().includes(focus.toLowerCase());
}

export function focusBaseFormSuggestion(
  baseForm: string | null,
  focusText: string,
): string | null {
  const trimmed = baseForm?.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.toLowerCase() === focusText.trim().toLowerCase()) {
    return null;
  }

  return trimmed;
}

export function baseFormSuggestionCacheKey(
  snippetId: string | undefined,
  noteGeneratedAt: string | undefined,
  focusText: string,
): string | null {
  const focusKey = focusText.trim();
  if (!snippetId || !noteGeneratedAt || !focusKey) {
    return null;
  }

  return `${snippetId}:${noteGeneratedAt}:${focusKey}`;
}
