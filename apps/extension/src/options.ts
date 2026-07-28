import type { AiProvider } from '@semia/shared';
import { saveSemiaSettings, getSemiaSettings } from './semiaSettings';

const aiProviderSelect = document.getElementById(
  'aiProvider',
) as HTMLSelectElement;
const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
const nativeLanguageSelect = document.getElementById(
  'nativeLanguage',
) as HTMLSelectElement;
const saveButton = document.getElementById('save') as HTMLButtonElement;
const statusEl = document.getElementById('status') as HTMLDivElement;

async function load(): Promise<void> {
  const settings = await getSemiaSettings();
  aiProviderSelect.value = settings.aiProvider ?? 'deepseek';
  apiKeyInput.value = settings.aiApiKey ?? '';
  nativeLanguageSelect.value = settings.nativeLanguage ?? 'zh-TW';
}

saveButton.addEventListener('click', () => {
  void (async () => {
    await saveSemiaSettings({
      aiProvider: aiProviderSelect.value as AiProvider,
      aiApiKey: apiKeyInput.value.trim(),
      nativeLanguage: nativeLanguageSelect.value,
    });
    statusEl.textContent = 'Saved.';
  })().catch((err) => {
    statusEl.textContent =
      err instanceof Error ? err.message : 'Failed to save settings.';
  });
});

void load();
