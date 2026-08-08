import type { FocusKeywordMode } from '@semia/shared';
import { FOCUS_KEYWORD_SUGGESTION_VERSION } from '@semia/shared';

export function focusKeywordSuggestionCacheKey(
  snippetId: string | undefined,
  userLevelMode: FocusKeywordMode,
  noteGeneratedAt: string | undefined,
): string | null {
  if (!snippetId || !noteGeneratedAt) {
    return null;
  }

  return `v${FOCUS_KEYWORD_SUGGESTION_VERSION}:${snippetId}:${userLevelMode}:${noteGeneratedAt}`;
}
