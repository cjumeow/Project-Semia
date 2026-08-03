/** Learning track languages (YouTube `lang` param). */
export const LEARNING_LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
] as const;

/** Native / translation target languages (Semia settings + YouTube `tlang`). */
export const NATIVE_LANGUAGE_OPTIONS = [
  { code: 'zh-TW', label: '繁體中文' },
  { code: 'zh-CN', label: '简体中文' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
] as const;

export type LearningLanguageCode =
  (typeof LEARNING_LANGUAGE_OPTIONS)[number]['code'];

export type NativeLanguageCode =
  (typeof NATIVE_LANGUAGE_OPTIONS)[number]['code'];

/** Map Semia native language tags to YouTube timedtext `tlang` values. */
export function toYoutubeTlang(nativeLanguage: string): string {
  const map: Record<string, string> = {
    'zh-TW': 'zh-Hant',
    'zh-CN': 'zh-Hans',
    'zh-Hans': 'zh-Hans',
    'zh-Hant': 'zh-Hant',
  };
  return map[nativeLanguage] ?? nativeLanguage;
}
