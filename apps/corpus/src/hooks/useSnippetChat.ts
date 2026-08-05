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
  streaming?: boolean;
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
      const assistantMessageId = nextMessageId();
      const assistantMessage: SnippetChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        streaming: true,
      };

      const history = toTurns(messagesByThread[threadKey] ?? []);

      setMessagesByThread((prev) => ({
        ...prev,
        [threadKey]: [...(prev[threadKey] ?? []), userMessage, assistantMessage],
      }));
      setDraft('');
      setError(null);
      setSending(true);

      try {
        if (!isLive) {
          throw new Error('AI chat requires the Chrome extension.');
        }

        await corpusRepository.streamSnippetChat(
          {
            fragment: chatSnippet ?? undefined,
            history,
            userMessage: trimmed,
          },
          {
            onChunk: (delta) => {
              setMessagesByThread((prev) => ({
                ...prev,
                [threadKey]: (prev[threadKey] ?? []).map((message) =>
                  message.id === assistantMessageId
                    ? { ...message, content: message.content + delta }
                    : message,
                ),
              }));
            },
            onDone: () => {
              setMessagesByThread((prev) => ({
                ...prev,
                [threadKey]: (prev[threadKey] ?? []).map((message) =>
                  message.id === assistantMessageId
                    ? { ...message, streaming: false }
                    : message,
                ),
              }));
            },
          },
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to send chat message.';
        setError(message);
        setMessagesByThread((prev) => ({
          ...prev,
          [threadKey]: (prev[threadKey] ?? []).filter(
            (entry) => entry.id !== assistantMessageId,
          ),
        }));
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
