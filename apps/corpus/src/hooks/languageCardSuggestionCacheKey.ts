import { BASE_FORM_SUGGESTION_VERSION } from '@semia/shared';
import type { LanguageCardSuggestableField } from '@semia/shared';

/** Bump when suggestion prompt rules change (invalidates client cache). */
export const LANGUAGE_CARD_SUGGESTION_PROMPT_VERSION = BASE_FORM_SUGGESTION_VERSION;

export function languageCardSuggestionCacheKey(
  snippetId: string | undefined,
  noteGeneratedAt: string | undefined,
  focusText: string,
  emptyFields: ReadonlyArray<LanguageCardSuggestableField>,
): string | null {
  if (!snippetId || !noteGeneratedAt) {
    return null;
  }

  const normalizedFocus = focusText.trim().toLowerCase();
  if (!normalizedFocus) {
    return null;
  }

  const fieldsKey = [...emptyFields].sort().join(',');
  return `v${LANGUAGE_CARD_SUGGESTION_PROMPT_VERSION}:${snippetId}:${noteGeneratedAt}:${normalizedFocus}:${fieldsKey}`;
}
