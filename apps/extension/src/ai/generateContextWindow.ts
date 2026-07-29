import type { LanguageFragment } from '@semia/shared';
import { buildContextWindowPrompt } from './buildContextWindowPrompt';
import { completeChat } from './chatCompletion';
import { parseContextWindowXml } from './parseContextWindowXml';
import { getSemiaSettings } from '../semiaSettings';

export async function generateContextWindow(
  fragment: LanguageFragment,
): Promise<string> {
  const settings = await getSemiaSettings();
  const nativeLanguage = settings.nativeLanguage?.trim() || 'zh-TW';
  const { system, user } = buildContextWindowPrompt({ fragment, nativeLanguage });
  const content = await completeChat(system, user);
  return parseContextWindowXml(content);
}
