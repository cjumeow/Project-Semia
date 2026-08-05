import {
  resolveSnippetChatThreadKey,
  snippetChatContextLabel,
  type SnippetChatTurn,
} from '@semia/shared';
import { useCallback, useState } from 'react';
import { corpusRepository } from '../data/corpusRepository';
import type { CorpusSnippet } from '../types/corpus';

export type SnippetChatMessage = SnippetChatTurn & {
  id: string;
};

function nextMessageId(): string {
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function toTurns(messages: SnippetChatMessage[]): SnippetChatTurn[] {
  return messages.map(({ role, content }) => ({ role, content }));
}

export function useSnippetChat({
  chatSnippet,
  isLive,
}: {
  chatSnippet: CorpusSnippet | null;
  isLive: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messagesByThread, setMessagesByThread] = useState<
    Record<string, SnippetChatMessage[]>
  >({});

  const threadKey = resolveSnippetChatThreadKey(chatSnippet?.id);
  const activeMessages = messagesByThread[threadKey] ?? [];
  const contextLabel = snippetChatContextLabel(chatSnippet?.selectedText);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || sending) return;

      const userMessage: SnippetChatMessage = {
        id: nextMessageId(),
        role: 'user',
        content: trimmed,
      };

      setMessagesByThread((prev) => ({
        ...prev,
        [threadKey]: [...(prev[threadKey] ?? []), userMessage],
      }));
      setDraft('');
      setError(null);
      setSending(true);

      try {
        if (!isLive) {
          throw new Error('AI chat requires the Chrome extension.');
        }

        const reply = await corpusRepository.sendSnippetChat({
          fragment: chatSnippet ?? undefined,
          history: toTurns(messagesByThread[threadKey] ?? []),
          userMessage: trimmed,
        });

        const assistantMessage: SnippetChatMessage = {
          id: nextMessageId(),
          role: 'assistant',
          content: reply,
        };

        setMessagesByThread((prev) => ({
          ...prev,
          [threadKey]: [...(prev[threadKey] ?? []), assistantMessage],
        }));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to send chat message.';
        setError(message);
      } finally {
        setSending(false);
      }
    },
    [chatSnippet, isLive, messagesByThread, sending, threadKey],
  );

  const toggle = useCallback(() => {
    setOpen((current) => !current);
    setError(null);
  }, []);

  return {
    open,
    setOpen,
    toggle,
    draft,
    setDraft,
    sending,
    error,
    activeMessages,
    contextLabel,
    threadKey,
    sendMessage,
    hasSnippetContext: Boolean(chatSnippet),
  };
}

export type UseSnippetChatResult = ReturnType<typeof useSnippetChat>;
