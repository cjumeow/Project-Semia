import type { LanguageFragment, SnippetChatTurn } from '@semia/shared';
import { buildSnippetChatSystemPrompt } from './buildSnippetChatPrompt';
import { completeChatMessages, streamChatMessages } from './chatCompletion';
import { getSemiaSettings } from '../semiaSettings';
import { getSnippetNote } from '../snippetNotesStorage';

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

async function buildSnippetChatRequestMessages(input: {
  fragment?: LanguageFragment;
  history: SnippetChatTurn[];
  userMessage: string;
  globalThread?: boolean;
}): Promise<ChatMessage[]> {
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
    globalThread: input.globalThread,
  });

  return [
    { role: 'system', content: system },
    ...input.history.map((turn) => ({
      role: turn.role,
      content: turn.content,
    })),
    { role: 'user', content: trimmed },
  ];
}

export async function sendSnippetChat(input: {
  fragment?: LanguageFragment;
  history: SnippetChatTurn[];
  userMessage: string;
  globalThread?: boolean;
}): Promise<string> {
  const messages = await buildSnippetChatRequestMessages(input);
  return completeChatMessages(messages);
}

export async function streamSnippetChat(
  input: {
    fragment?: LanguageFragment;
    history: SnippetChatTurn[];
    userMessage: string;
    globalThread?: boolean;
  },
  onDelta: (delta: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const messages = await buildSnippetChatRequestMessages(input);
  await streamChatMessages(messages, onDelta, signal);
}
