export type LanguageCardSuggestableField = 'meaning' | 'example';

export type LanguageCardFieldSuggestions = Partial<
  Record<LanguageCardSuggestableField, string>
>;

export function parseLanguageCardFieldSuggestions(
  content: string,
  fields: ReadonlyArray<LanguageCardSuggestableField>,
): LanguageCardFieldSuggestions {
  const result: LanguageCardFieldSuggestions = {};
  const normalized = content.trim();
  if (!normalized) {
    return result;
  }

  for (const field of fields) {
    const label = field === 'meaning' ? 'MEANING' : 'EXAMPLE';
    const pattern = new RegExp(
      `${label}\\s*:\\s*([\\s\\S]*?)(?=\\n(?:MEANING|EXAMPLE)\\s*:|$)`,
      'i',
    );
    const match = normalized.match(pattern);
    const value = match?.[1]?.trim();
    if (value) {
      result[field] = value;
    }
  }

  return result;
}
