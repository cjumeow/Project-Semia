import type { SemiaSettings } from '@semia/shared';
import {
  LEARNING_LANGUAGE_OPTIONS,
  NATIVE_LANGUAGE_OPTIONS,
  type LearningLanguageCode,
  type NativeLanguageCode,
} from '@semia/shared';

export type SubtitleSettingsPatch = {
  learningLanguage?: string;
  nativeLanguage?: string;
  bilingualCaptionsEnabled?: boolean;
};

const LEARNING_CODES = new Set<string>(
  LEARNING_LANGUAGE_OPTIONS.map((option) => option.code),
);

const NATIVE_CODES = new Set<string>(
  NATIVE_LANGUAGE_OPTIONS.map((option) => option.code),
);

export function normalizeLearningLanguage(value: string | undefined): LearningLanguageCode {
  if (value && LEARNING_CODES.has(value)) {
    return value as LearningLanguageCode;
  }
  return 'en';
}

export function normalizeNativeLanguage(value: string | undefined): NativeLanguageCode {
  if (value && NATIVE_CODES.has(value)) {
    return value as NativeLanguageCode;
  }
  return 'zh-TW';
}

export function mergeSubtitleSettingsPatch(
  current: SemiaSettings,
  patch: SubtitleSettingsPatch,
): SemiaSettings {
  return {
    ...current,
    learningLanguage: normalizeLearningLanguage(
      patch.learningLanguage ?? current.learningLanguage,
    ),
    nativeLanguage: normalizeNativeLanguage(
      patch.nativeLanguage ?? current.nativeLanguage,
    ),
    bilingualCaptionsEnabled:
      patch.bilingualCaptionsEnabled ?? current.bilingualCaptionsEnabled !== false,
  };
}
