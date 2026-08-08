export type LanguageCardSuggestionField = 'focus' | 'meaning' | 'example';

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

export function shouldRequestLanguageCardFieldSuggestions({
  focusInSpeech,
  emptyFields,
}: {
  focusInSpeech: boolean;
  emptyFields: ReadonlyArray<'meaning' | 'example'>;
}): boolean {
  return focusInSpeech && emptyFields.length > 0;
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

export function emptyLanguageCardSuggestionFields({
  meaningEmpty,
  exampleEnabled,
  exampleEmpty,
}: {
  meaningEmpty: boolean;
  exampleEnabled: boolean;
  exampleEmpty: boolean;
}): Array<'meaning' | 'example'> {
  const fields: Array<'meaning' | 'example'> = [];
  if (meaningEmpty) {
    fields.push('meaning');
  }
  if (exampleEnabled && exampleEmpty) {
    fields.push('example');
  }
  return fields;
}
