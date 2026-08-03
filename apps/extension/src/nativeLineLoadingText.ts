import { NATIVE_LANGUAGE_OPTIONS } from '@semia/shared';

const LOADING_TEXT_BY_NATIVE: Record<string, string> = {
  'zh-TW': '翻譯載入中',
  'zh-CN': '翻译加载中',
  en: 'Loading translation…',
  ja: '翻訳を読み込み中…',
  ko: '번역 불러오는 중…',
};

export function getNativeLineLoadingText(nativeLanguage: string | undefined): string {
  const code = nativeLanguage?.trim();
  if (code && LOADING_TEXT_BY_NATIVE[code]) {
    return LOADING_TEXT_BY_NATIVE[code]!;
  }
  const supported = NATIVE_LANGUAGE_OPTIONS.some((option) => option.code === code);
  if (supported) {
    return LOADING_TEXT_BY_NATIVE['zh-TW']!;
  }
  return LOADING_TEXT_BY_NATIVE['zh-TW']!;
}
