import type { LanguageFragment, SnippetNote } from '@semia/shared';
import { buildSnippetNotePrompt } from './buildSnippetNotePrompt';
import { completeChat } from './chatCompletion';
import { parseSnippetNoteXml } from './parseSnippetNoteXml';
import { getSemiaSettings } from '../semiaSettings';

export async function generateSnippetNote(
  fragment: LanguageFragment,
): Promise<SnippetNote> {
  const settings = await getSemiaSettings();
  const nativeLanguage = settings.nativeLanguage?.trim() || 'zh-TW';
  const { system, user } = buildSnippetNotePrompt({ fragment, nativeLanguage });
  const content = await completeChat(system, user);
  return parseSnippetNoteXml(content, fragment);
}
