import {
  SEMIA_SETTINGS_STORAGE_KEY,
  type SemiaSettings,
} from '@semia/shared';

const DEFAULT_SETTINGS: SemiaSettings = {
  aiProvider: 'deepseek',
  nativeLanguage: 'zh-TW',
  contextWindowEnabled: true,
};

export async function getSemiaSettings(): Promise<SemiaSettings> {
  const result = await chrome.storage.local.get(SEMIA_SETTINGS_STORAGE_KEY);
  const stored = (result[SEMIA_SETTINGS_STORAGE_KEY] ?? {}) as SemiaSettings;
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    aiApiKey: stored.aiApiKey ?? stored.openAiApiKey,
  };
}

export async function saveSemiaSettings(
  settings: SemiaSettings,
): Promise<void> {
  await chrome.storage.local.set({
    [SEMIA_SETTINGS_STORAGE_KEY]: {
      aiProvider: settings.aiProvider ?? 'deepseek',
      aiApiKey: settings.aiApiKey?.trim() || undefined,
      nativeLanguage: settings.nativeLanguage ?? 'zh-TW',
      contextWindowEnabled: settings.contextWindowEnabled !== false,
      languageCardsProEnabled: settings.languageCardsProEnabled === true,
    },
  });
}
