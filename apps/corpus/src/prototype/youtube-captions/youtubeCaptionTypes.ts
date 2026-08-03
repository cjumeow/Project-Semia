export const LEARNING_LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
] as const;

export const NATIVE_LANGUAGE_OPTIONS = [
  { code: 'zh-TW', label: '繁體中文' },
  { code: 'zh-Hans', label: '简体中文' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
] as const;

export type LearningLanguageCode =
  (typeof LEARNING_LANGUAGE_OPTIONS)[number]['code'];

export type NativeLanguageCode =
  (typeof NATIVE_LANGUAGE_OPTIONS)[number]['code'];

export type CuePair = {
  cueIndex: number;
  learningText: string;
  nativeText: string;
  timestamp: string;
};

export type YoutubeCaptionsPrototypeState = {
  cuePairs: CuePair[];
  activeCueIndex: number;
  learningLanguage: LearningLanguageCode;
  nativeLanguage: NativeLanguageCode;
  bilingualEnabled: boolean;
  capturePanelOpen: boolean;
  settingsPopoverOpen: boolean;
  selectedWords: string[];
  setLearningLanguage: (code: LearningLanguageCode) => void;
  setNativeLanguage: (code: NativeLanguageCode) => void;
  setBilingualEnabled: (enabled: boolean) => void;
  setCapturePanelOpen: (open: boolean) => void;
  setSettingsPopoverOpen: (open: boolean) => void;
  setActiveCueIndex: (index: number) => void;
  selectCue: (index: number) => void;
  toggleBilingual: () => void;
  nextCue: () => void;
  prevCue: () => void;
  toggleWord: (word: string) => void;
};
