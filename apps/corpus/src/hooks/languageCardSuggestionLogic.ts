export type LanguageCardSuggestionField = 'focus' | 'meaning' | 'example';

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
