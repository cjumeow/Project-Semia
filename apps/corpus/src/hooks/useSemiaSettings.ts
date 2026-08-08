import {
  applySemiaThemeForDarkModeEnabled,
  getLanguageCardDefaultOptionalFields,
  getLearningLanguage,
  getNativeLanguage,
  isContextWindowEnabled,
  isDarkModeEnabled,
  isLanguageCardAiSuggestionsEnabled,
  isLanguageCardsProEnabled,
  isSnippetChatDragModeEnabled,
  readSemiaThemeModeFromDocument,
  SEMIA_SETTINGS_STORAGE_KEY,
  type LanguageCardOptionalFieldKey,
  type LearningLanguageCode,
  type NativeLanguageCode,
  type SemiaSettings,
} from '@semia/shared';
import { useCallback, useEffect, useState } from 'react';

const DEFAULT_SETTINGS: SemiaSettings = {
  nativeLanguage: 'zh-TW',
  learningLanguage: 'en',
  contextWindowEnabled: true,
  languageCardsProEnabled: false,
  languageCardAiSuggestionsEnabled: true,
  languageCardDefaultOptionalFields: [],
};

function readStoredSettings(): SemiaSettings {
  const docTheme = readSemiaThemeModeFromDocument();
  const fromDocument =
    docTheme !== null
      ? { ...DEFAULT_SETTINGS, darkModeEnabled: docTheme === 'dark' }
      : DEFAULT_SETTINGS;

  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    return fromDocument;
  }

  try {
    const raw = localStorage.getItem(SEMIA_SETTINGS_STORAGE_KEY);
    if (!raw) return fromDocument;
    return { ...fromDocument, ...(JSON.parse(raw) as SemiaSettings) };
  } catch {
    return fromDocument;
  }
}

async function loadSettings(): Promise<SemiaSettings> {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    const result = await chrome.storage.local.get(SEMIA_SETTINGS_STORAGE_KEY);
    const stored = (result[SEMIA_SETTINGS_STORAGE_KEY] ?? {}) as SemiaSettings;
    return { ...DEFAULT_SETTINGS, ...stored };
  }

  return readStoredSettings();
}

async function persistSettings(settings: SemiaSettings): Promise<void> {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    await chrome.storage.local.set({
      [SEMIA_SETTINGS_STORAGE_KEY]: settings,
    });
    return;
  }

  localStorage.setItem(SEMIA_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export function useSemiaSettings(): {
  settings: SemiaSettings;
  loading: boolean;
  contextWindowEnabled: boolean;
  languageCardsProEnabled: boolean;
  languageCardAiSuggestionsEnabled: boolean;
  languageCardDefaultOptionalFields: LanguageCardOptionalFieldKey[];
  learningLanguage: LearningLanguageCode;
  nativeLanguage: NativeLanguageCode;
  darkModeEnabled: boolean;
  snippetChatDragModeEnabled: boolean;
  setContextWindowEnabled: (enabled: boolean) => Promise<void>;
  setLanguageCardsProEnabled: (enabled: boolean) => Promise<void>;
  setLanguageCardAiSuggestionsEnabled: (enabled: boolean) => Promise<void>;
  setLanguageCardDefaultOptionalFields: (
    fields: LanguageCardOptionalFieldKey[],
  ) => Promise<void>;
  setLearningLanguage: (code: LearningLanguageCode) => Promise<void>;
  setNativeLanguage: (code: NativeLanguageCode) => Promise<void>;
  setDarkModeEnabled: (enabled: boolean) => Promise<void>;
  setSnippetChatDragModeEnabled: (enabled: boolean) => Promise<void>;
  setSkipInboxArchiveWithoutFormalCardConfirm: (skip: boolean) => Promise<void>;
} {
  const [settings, setSettings] = useState<SemiaSettings>(readStoredSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void loadSettings().then((loaded) => {
      if (!cancelled) {
        setSettings(loaded);
        setLoading(false);
      }
    });

    if (typeof chrome === 'undefined' || !chrome.storage?.onChanged) {
      return () => {
        cancelled = true;
      };
    }

    const onChanged = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string,
    ): void => {
      if (areaName !== 'local' || !changes[SEMIA_SETTINGS_STORAGE_KEY]) {
        return;
      }

      const next = changes[SEMIA_SETTINGS_STORAGE_KEY].newValue as
        | SemiaSettings
        | undefined;
      const merged = { ...DEFAULT_SETTINGS, ...(next ?? {}) };
      applySemiaThemeForDarkModeEnabled(isDarkModeEnabled(merged), {
        instant: true,
      });
      setSettings(merged);
    };

    chrome.storage.onChanged.addListener(onChanged);
    return () => {
      cancelled = true;
      chrome.storage.onChanged.removeListener(onChanged);
    };
  }, []);

  const updateSettings = useCallback(
    async (patch: Partial<SemiaSettings>): Promise<void> => {
      const next = { ...settings, ...patch };
      setSettings(next);
      await persistSettings(next);
    },
    [settings],
  );

  const setContextWindowEnabled = useCallback(
    async (enabled: boolean): Promise<void> => {
      await updateSettings({ contextWindowEnabled: enabled });
    },
    [updateSettings],
  );

  const setLanguageCardsProEnabled = useCallback(
    async (enabled: boolean): Promise<void> => {
      await updateSettings({ languageCardsProEnabled: enabled });
    },
    [updateSettings],
  );

  const setLanguageCardAiSuggestionsEnabled = useCallback(
    async (enabled: boolean): Promise<void> => {
      await updateSettings({ languageCardAiSuggestionsEnabled: enabled });
    },
    [updateSettings],
  );

  const setLanguageCardDefaultOptionalFields = useCallback(
    async (fields: LanguageCardOptionalFieldKey[]): Promise<void> => {
      await updateSettings({
        languageCardDefaultOptionalFields:
          getLanguageCardDefaultOptionalFields({
            languageCardDefaultOptionalFields: fields,
          }),
      });
    },
    [updateSettings],
  );

  const setLearningLanguage = useCallback(
    async (learningLanguage: LearningLanguageCode): Promise<void> => {
      await updateSettings({ learningLanguage });
    },
    [updateSettings],
  );

  const setNativeLanguage = useCallback(
    async (nativeLanguage: NativeLanguageCode): Promise<void> => {
      await updateSettings({ nativeLanguage });
    },
    [updateSettings],
  );

  const setDarkModeEnabled = useCallback(
    async (enabled: boolean): Promise<void> => {
      applySemiaThemeForDarkModeEnabled(enabled, { instant: true });
      const next = { ...settings, darkModeEnabled: enabled };
      setSettings(next);
      await persistSettings(next);
    },
    [settings],
  );

  const setSnippetChatDragModeEnabled = useCallback(
    async (enabled: boolean): Promise<void> => {
      await updateSettings({ snippetChatDragModeEnabled: enabled });
    },
    [updateSettings],
  );

  const setSkipInboxArchiveWithoutFormalCardConfirm = useCallback(
    async (skip: boolean): Promise<void> => {
      await updateSettings({ skipInboxArchiveWithoutFormalCardConfirm: skip });
    },
    [updateSettings],
  );

  return {
    settings,
    loading,
    contextWindowEnabled: isContextWindowEnabled(settings),
    languageCardsProEnabled: isLanguageCardsProEnabled(settings),
    languageCardAiSuggestionsEnabled:
      isLanguageCardAiSuggestionsEnabled(settings),
    languageCardDefaultOptionalFields:
      getLanguageCardDefaultOptionalFields(settings),
    learningLanguage: getLearningLanguage(settings),
    nativeLanguage: getNativeLanguage(settings),
    darkModeEnabled: isDarkModeEnabled(settings),
    snippetChatDragModeEnabled: isSnippetChatDragModeEnabled(settings),
    setContextWindowEnabled,
    setLanguageCardsProEnabled,
    setLanguageCardAiSuggestionsEnabled,
    setLanguageCardDefaultOptionalFields,
    setLearningLanguage,
    setNativeLanguage,
    setDarkModeEnabled,
    setSnippetChatDragModeEnabled,
    setSkipInboxArchiveWithoutFormalCardConfirm,
  };
}
