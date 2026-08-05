import type { LanguageFragment } from './types';

export const SNIPPET_CHAT_GENERAL_THREAD_KEY = '__general__';
export const SNIPPET_CHAT_PORT_NAME = 'semia-snippet-chat';

export type SnippetChatTurn = {
  role: 'user' | 'assistant';
  content: string;
};

export type SnippetChatPortStart = {
  type: 'start';
  fragment?: LanguageFragment;
  history: SnippetChatTurn[];
  userMessage: string;
};

export type SnippetChatPortMessage =
  | { type: 'chunk'; delta: string }
  | { type: 'done' }
  | { type: 'error'; error: string };

export function resolveSnippetChatThreadKey(
  fragmentId: string | null | undefined,
): string {
  const trimmed = fragmentId?.trim();
  return trimmed ? trimmed : SNIPPET_CHAT_GENERAL_THREAD_KEY;
}

export function snippetChatContextLabel(
  selectedText: string | null | undefined,
): string {
  const trimmed = selectedText?.trim();
  return trimmed ? trimmed : 'General chat';
}

export const SNIPPET_CHAT_SUGGESTED_PROMPTS = [
  '日常生活用法是什麼？',
  '給我三個相關例句',
  '口語跟書面有什麼差別？',
] as const;
