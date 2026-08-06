import {
  didSnippetChatContextChange,
  finalizeStreamingAssistantMessages,
  formatSnippetChatContextSwitchNotice,
  isSnippetChatAbortedError,
  resolveGlobalSnippetChatThreadKey,
  resolveSnippetChatThreadKey,
  snippetChatContextLabel,
  type SnippetChatTurn,
} from '@semia/shared';
import { useCallback, useEffect, useRef, useState } from 'react';
import { corpusRepository } from '../data/corpusRepository';
import type { CorpusSnippet } from '../types/corpus';

export type SnippetChatMessageKind = 'chat' | 'context-switch';

export type SnippetChatMessage = SnippetChatTurn & {
  id: string;
  streaming?: boolean;
  kind?: SnippetChatMessageKind;
};

function nextMessageId(): string {
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function toTurns(messages: SnippetChatMessage[]): SnippetChatTurn[] {
  return messages
    .filter(
      (message) => !message.streaming && message.kind !== 'context-switch',
    )
    .map(({ role, content }) => ({ role, content }));
}

export function useSnippetChat({
  chatSnippet,
  isLive,
  globalThread = true,
}: {
  chatSnippet: CorpusSnippet | null;
  isLive: boolean;
  globalThread?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messagesByThread, setMessagesByThread] = useState<
    Record<string, SnippetChatMessage[]>
  >({});

  const streamAbortRef = useRef<AbortController | null>(null);
  const activeStreamRef = useRef<{
    threadKey: string;
    assistantMessageId: string;
  } | null>(null);

  const lastGroundedFragmentIdRef = useRef<string | null>(null);

  const threadKey = globalThread
    ? resolveGlobalSnippetChatThreadKey()
    : resolveSnippetChatThreadKey(chatSnippet?.id);
  const activeMessages = messagesByThread[threadKey] ?? [];
  const contextLabel = snippetChatContextLabel(chatSnippet?.selectedText);

  const appendContextSwitchNotice = useCallback(
    (snippet: CorpusSnippet) => {
      if (!globalThread) return;

      setMessagesByThread((prev) => ({
        ...prev,
        [threadKey]: [
          ...(prev[threadKey] ?? []),
          {
            id: nextMessageId(),
            role: 'assistant',
            kind: 'context-switch',
            content: formatSnippetChatContextSwitchNotice(snippet),
          },
        ],
      }));
    },
    [globalThread, threadKey],
  );

  const recordContextSwitch = useCallback(
    (snippet: CorpusSnippet | null | undefined) => {
      if (!globalThread || !snippet) return;

      const previousId = lastGroundedFragmentIdRef.current;
      if (didSnippetChatContextChange(previousId, snippet.id)) {
        appendContextSwitchNotice(snippet);
      }
      lastGroundedFragmentIdRef.current = snippet.id;
    },
    [appendContextSwitchNotice, globalThread],
  );

  useEffect(() => {
    if (!globalThread || !chatSnippet) {
      return;
    }

    if (open) {
      recordContextSwitch(chatSnippet);
      return;
    }

    lastGroundedFragmentIdRef.current = chatSnippet.id;
  }, [chatSnippet, globalThread, open, recordContextSwitch]);

  const finalizeActiveAssistant = useCallback(() => {
    const active = activeStreamRef.current;
    if (!active) return;

    setMessagesByThread((prev) => ({
      ...prev,
      [active.threadKey]: finalizeStreamingAssistantMessages(
        prev[active.threadKey] ?? [],
      ),
    }));
    activeStreamRef.current = null;
  }, []);

  const abortActiveStream = useCallback(() => {
    streamAbortRef.current?.abort();
    streamAbortRef.current = null;
    finalizeActiveAssistant();
    setSending(false);
  }, [finalizeActiveAssistant]);

  const abortActiveStreamRef = useRef(abortActiveStream);
  abortActiveStreamRef.current = abortActiveStream;

  useEffect(() => {
    if (globalThread) {
      return;
    }
    abortActiveStreamRef.current();
  }, [globalThread, threadKey]);

  useEffect(() => {
    return () => {
      streamAbortRef.current?.abort();
      streamAbortRef.current = null;
    };
  }, []);

  const closeChat = useCallback(() => {
    abortActiveStream();
    setOpen(false);
    setError(null);
  }, [abortActiveStream]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      abortActiveStream();

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
      const abortController = new AbortController();
      streamAbortRef.current = abortController;
      activeStreamRef.current = { threadKey, assistantMessageId };

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
            globalThread,
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
          { signal: abortController.signal },
        );
      } catch (err) {
        if (isSnippetChatAbortedError(err)) {
          return;
        }

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
        if (streamAbortRef.current === abortController) {
          streamAbortRef.current = null;
        }
        if (activeStreamRef.current?.assistantMessageId === assistantMessageId) {
          activeStreamRef.current = null;
        }
        setSending(false);
      }
    },
    [abortActiveStream, chatSnippet, globalThread, isLive, messagesByThread, threadKey],
  );

  const toggle = useCallback(() => {
    setOpen((current) => {
      if (current) {
        abortActiveStream();
      }
      return !current;
    });
    setError(null);
  }, [abortActiveStream]);

  return {
    open,
    setOpen,
    closeChat,
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
    globalThread,
    recordContextSwitch,
  };
}

export type UseSnippetChatResult = ReturnType<typeof useSnippetChat>;
