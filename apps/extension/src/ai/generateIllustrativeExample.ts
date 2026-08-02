import type { LanguageFragment } from '@semia/shared';
import { buildIllustrativeExamplePrompt } from './buildIllustrativeExamplePrompt';
import { completeChat } from './chatCompletion';
import { parseIllustrativeExampleXml } from './parseSnippetNoteXml';
import { getSemiaSettings } from '../semiaSettings';

export async function generateIllustrativeExample(
  fragment: LanguageFragment,
): Promise<string> {
  const settings = await getSemiaSettings();
  const nativeLanguage = settings.nativeLanguage?.trim() || 'zh-TW';
  const { system, user } = buildIllustrativeExamplePrompt({
    fragment,
    nativeLanguage,
  });
  const content = await completeChat(system, user);
  return parseIllustrativeExampleXml(content);
}
