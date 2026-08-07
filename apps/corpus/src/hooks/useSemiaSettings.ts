import {
  applySemiaThemeToDocument,
  isContextWindowEnabled,
  isDarkModeEnabled,
  isLanguageCardAiSuggestionsEnabled,
  isLanguageCardsProEnabled,
  isSnippetChatDragModeEnabled,
  SEMIA_SETTINGS_STORAGE_KEY,
  semiaThemeModeForDarkModeEnabled,
  type SemiaSettings,
} from '@semia/shared';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';

const DEFAULT_SETTINGS: SemiaSettings = {
  nativeLanguage: 'zh-TW',
  contextWindowEnabled: true,
  languageCardsProEnabled: false,
  languageCardAiSuggestionsEnabled: true,
};

function readStoredSettings(): SemiaSettings {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    return DEFAULT_SETTINGS;
  }

  try {
    const raw = localStorage.getItem(SEMIA_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as SemiaSettings) };
  } catch {
    return DEFAULT_SETTINGS;
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
  darkModeEnabled: boolean;
  snippetChatDragModeEnabled: boolean;
  setContextWindowEnabled: (enabled: boolean) => Promise<void>;
  setLanguageCardsProEnabled: (enabled: boolean) => Promise<void>;
  setLanguageCardAiSuggestionsEnabled: (enabled: boolean) => Promise<void>;
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
      setSettings({ ...DEFAULT_SETTINGS, ...(next ?? {}) });
    };

    chrome.storage.onChanged.addListener(onChanged);
    return () => {
      cancelled = true;
      chrome.storage.onChanged.removeListener(onChanged);
    };
  }, []);

  useLayoutEffect(() => {
    applySemiaThemeToDocument(
      semiaThemeModeForDarkModeEnabled(isDarkModeEnabled(settings)),
    );
  }, [settings]);

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

  const setDarkModeEnabled = useCallback(
    async (enabled: boolean): Promise<void> => {
      await updateSettings({ darkModeEnabled: enabled });
    },
    [updateSettings],
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
    darkModeEnabled: isDarkModeEnabled(settings),
    snippetChatDragModeEnabled: isSnippetChatDragModeEnabled(settings),
    setContextWindowEnabled,
    setLanguageCardsProEnabled,
    setLanguageCardAiSuggestionsEnabled,
    setDarkModeEnabled,
    setSnippetChatDragModeEnabled,
    setSkipInboxArchiveWithoutFormalCardConfirm,
  };
}
