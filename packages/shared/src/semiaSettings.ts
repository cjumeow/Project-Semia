import type { SemiaSettings } from './types';
import {
  isLanguageCardOptionalFieldKey,
  LANGUAGE_CARD_OPTIONAL_FIELD_KEYS,
  type LanguageCardOptionalFieldKey,
} from './languageCardOptionalFields';
import type { LearningLanguageCode, NativeLanguageCode } from './subtitleLanguages';

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

export function getLanguageCardDefaultOptionalFields(
  settings?: SemiaSettings,
): LanguageCardOptionalFieldKey[] {
  const fields = settings?.languageCardDefaultOptionalFields;
  if (!Array.isArray(fields)) {
    return [];
  }

  const seen = new Set<LanguageCardOptionalFieldKey>();
  const normalized: LanguageCardOptionalFieldKey[] = [];
  for (const field of fields) {
    if (!isLanguageCardOptionalFieldKey(field) || seen.has(field)) {
      continue;
    }
    seen.add(field);
    normalized.push(field);
  }

  return normalized.sort(
    (left, right) =>
      LANGUAGE_CARD_OPTIONAL_FIELD_KEYS.indexOf(left) -
      LANGUAGE_CARD_OPTIONAL_FIELD_KEYS.indexOf(right),
  );
}

export function getLearningLanguage(
  settings?: SemiaSettings,
): LearningLanguageCode {
  const code = settings?.learningLanguage;
  if (code === 'ja' || code === 'ko' || code === 'es' || code === 'fr' || code === 'de') {
    return code;
  }
  return 'en';
}

export function getNativeLanguage(settings?: SemiaSettings): NativeLanguageCode {
  const code = settings?.nativeLanguage;
  if (
    code === 'zh-TW' ||
    code === 'zh-CN' ||
    code === 'en' ||
    code === 'ja' ||
    code === 'ko'
  ) {
    return code;
  }
  return 'zh-TW';
}

/** @deprecated Unified focus keyword prompt; retained for legacy stored settings. */
export function getFocusKeywordMode(
  settings?: SemiaSettings,
): 'daily' | 'advanced' {
  return settings?.focusKeywordMode === 'advanced' ? 'advanced' : 'daily';
}
