import { toGtxTargetLanguage } from './gtxTargetLanguage';
import { getSemiaSettings } from './semiaSettings';
import { translateGtxText } from './translateGtx';

/**
 * Translate selection text to the user's native language (low-latency, cache-first).
 */
export async function translateSelectionText(
  text: string,
  signal?: AbortSignal,
): Promise<string> {
  const settings = await getSemiaSettings();
  const nativeLang = settings.nativeLanguage?.trim() || 'zh-TW';
  return translateGtxText({
    text,
    sourceLang: 'auto',
    targetLang: toGtxTargetLanguage(nativeLang),
    signal,
  });
}
