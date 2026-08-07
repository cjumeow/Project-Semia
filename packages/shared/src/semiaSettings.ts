import type { SemiaSettings } from './types';

/** Context window is on by default; only an explicit `false` disables it. */
export function isContextWindowEnabled(settings?: SemiaSettings): boolean {
  return settings?.contextWindowEnabled !== false;
}

/** Language cards require Pro; stub flag must be explicitly enabled. */
export function isLanguageCardsProEnabled(settings?: SemiaSettings): boolean {
  return settings?.languageCardsProEnabled === true;
}

/** AI field suggestions default on; only an explicit `false` disables them. */
export function isLanguageCardAiSuggestionsEnabled(
  settings?: SemiaSettings,
): boolean {
  return settings?.languageCardAiSuggestionsEnabled !== false;
}

/** Dark mode (Cursor deep) is off unless explicitly enabled. */
export function isDarkModeEnabled(settings?: SemiaSettings): boolean {
  return settings?.darkModeEnabled === true;
}

/** Chat drag mode is off unless explicitly enabled. */
export function isSnippetChatDragModeEnabled(settings?: SemiaSettings): boolean {
  return settings?.snippetChatDragModeEnabled === true;
}
