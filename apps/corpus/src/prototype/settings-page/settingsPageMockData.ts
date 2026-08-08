import type {
  LanguageCardOptionalFieldKey,
  LearningLanguageCode,
  NativeLanguageCode,
} from '@semia/shared';

export type SettingsPageState = {
  darkModeEnabled: boolean;
  contextWindowEnabled: boolean;
  languageCardAiSuggestionsEnabled: boolean;
  defaultOptionalFields: LanguageCardOptionalFieldKey[];
  learningLanguage: LearningLanguageCode;
  nativeLanguage: NativeLanguageCode;
};

export const INITIAL_SETTINGS_PAGE_STATE: SettingsPageState = {
  darkModeEnabled: false,
  contextWindowEnabled: true,
  languageCardAiSuggestionsEnabled: true,
  defaultOptionalFields: ['example'],
  learningLanguage: 'en',
  nativeLanguage: 'zh-TW',
};
