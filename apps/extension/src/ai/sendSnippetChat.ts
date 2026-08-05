import type { LanguageFragment, SnippetChatTurn } from '@semia/shared';
import { buildSnippetChatSystemPrompt } from './buildSnippetChatPrompt';
import { completeChatMessages } from './chatCompletion';
import { getSemiaSettings } from '../semiaSettings';
import { getSnippetNote } from '../snippetNotesStorage';

export async function sendSnippetChat(input: {
  fragment?: LanguageFragment;
  history: SnippetChatTurn[];
  userMessage: string;
}): Promise<string> {
  const trimmed = input.userMessage.trim();
  if (!trimmed) {
    throw new Error('Message cannot be empty.');
  }

  const settings = await getSemiaSettings();
  const nativeLanguage = settings.nativeLanguage?.trim() || 'zh-TW';
  const note = input.fragment
    ? ((await getSnippetNote(input.fragment.id)) ?? undefined)
    : undefined;

  const system = buildSnippetChatSystemPrompt({
    fragment: input.fragment,
    note,
    nativeLanguage,
  });

  return completeChatMessages([
    { role: 'system', content: system },
    ...input.history.map((turn) => ({
      role: turn.role,
      content: turn.content,
    })),
    { role: 'user', content: trimmed },
  ]);
}
