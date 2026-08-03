import { useCallback, useState } from 'react';
import { MOCK_CUE_PAIRS } from './mockCuePairs';
import type {
  LearningLanguageCode,
  NativeLanguageCode,
  YoutubeCaptionsPrototypeState,
} from './youtubeCaptionTypes';

export function useYoutubeCaptionsPrototypeState(): YoutubeCaptionsPrototypeState {
  const [activeCueIndex, setActiveCueIndex] = useState(1);
  const [learningLanguage, setLearningLanguage] =
    useState<LearningLanguageCode>('en');
  const [nativeLanguage, setNativeLanguage] =
    useState<NativeLanguageCode>('zh-TW');
  const [bilingualEnabled, setBilingualEnabled] = useState(true);
  const [capturePanelOpen, setCapturePanelOpen] = useState(true);
  const [settingsPopoverOpen, setSettingsPopoverOpen] = useState(false);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  const nextCue = useCallback(() => {
    setActiveCueIndex((index) =>
      Math.min(index + 1, MOCK_CUE_PAIRS.length - 1),
    );
    setSelectedWords([]);
  }, []);

  const prevCue = useCallback(() => {
    setActiveCueIndex((index) => Math.max(index - 1, 0));
    setSelectedWords([]);
  }, []);

  const toggleWord = useCallback((word: string) => {
    setSelectedWords((current) =>
      current.includes(word)
        ? current.filter((item) => item !== word)
        : [...current, word],
    );
  }, []);

  const toggleBilingual = useCallback(() => {
    setBilingualEnabled((value) => !value);
  }, []);

  const selectCue = useCallback((index: number) => {
    setActiveCueIndex(index);
    setSelectedWords([]);
  }, []);

  return {
    cuePairs: MOCK_CUE_PAIRS,
    activeCueIndex,
    learningLanguage,
    nativeLanguage,
    bilingualEnabled,
    capturePanelOpen,
    settingsPopoverOpen,
    selectedWords,
    setLearningLanguage,
    setNativeLanguage,
    setBilingualEnabled,
    setCapturePanelOpen,
    setSettingsPopoverOpen,
    setActiveCueIndex,
    selectCue,
    toggleBilingual,
    nextCue,
    prevCue,
    toggleWord,
  };
}
