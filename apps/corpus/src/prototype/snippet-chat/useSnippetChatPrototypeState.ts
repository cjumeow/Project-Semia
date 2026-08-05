import { useCallback, useMemo, useState } from 'react';
import { MOCK_CARDS, MOCK_SNIPPETS } from './mockData';

export const GENERAL_THREAD_KEY = '__general__';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  threadKey: string;
};

export const SUGGESTED_PROMPTS = [
  '日常生活用法是什麼？',
  '給我三個相關例句',
  '口語跟書面有什麼差別？',
] as const;

function nextId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function stubAssistantReply(
  userText: string,
  snippetLabel: string | null,
): string {
  if (!snippetLabel) {
    return `（一般模式）收到：「${userText}」。選一筆 snippet 後，我會自動附上 note 與 context。`;
  }
  return `（${snippetLabel}）關於你的問題：「${userText}」——這是 prototype 假回覆；正式版會帶入 SnippetNote + context window。`;
}

export function useSnippetChatPrototypeState(variant: string) {
  const [selectedSnippetId, setSelectedSnippetId] = useState<string | null>(
    'snip-naval',
  );
  const [chatOpen, setChatOpen] = useState(true);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [cardListModalOpen, setCardListModalOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messagesByThread, setMessagesByThread] = useState<
    Record<string, ChatMessage[]>
  >({});

  const selectedSnippet = useMemo(
    () => MOCK_SNIPPETS.find((s) => s.id === selectedSnippetId) ?? null,
    [selectedSnippetId],
  );

  const activeThreadKey = selectedSnippetId ?? GENERAL_THREAD_KEY;

  const activeMessages = messagesByThread[activeThreadKey] ?? [];

  const cardsForSnippet = useMemo(() => {
    if (!selectedSnippetId) return [];
    return MOCK_CARDS.filter((c) => c.sourceFragmentId === selectedSnippetId);
  }, [selectedSnippetId]);

  const expandedCard = useMemo(
    () => MOCK_CARDS.find((c) => c.id === expandedCardId) ?? null,
    [expandedCardId],
  );

  const contextLabel = selectedSnippet
    ? selectedSnippet.selectedText
    : 'General chat';

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const userMsg: ChatMessage = {
        id: nextId(),
        role: 'user',
        content: trimmed,
        threadKey: activeThreadKey,
      };
      const assistantMsg: ChatMessage = {
        id: nextId(),
        role: 'assistant',
        content: stubAssistantReply(
          trimmed,
          selectedSnippet?.selectedText ?? null,
        ),
        threadKey: activeThreadKey,
      };

      setMessagesByThread((prev) => ({
        ...prev,
        [activeThreadKey]: [...(prev[activeThreadKey] ?? []), userMsg, assistantMsg],
      }));
      setDraft('');
    },
    [activeThreadKey, selectedSnippet],
  );

  const threadSummaries = useMemo(() => {
    const keys = Object.keys(messagesByThread);
    return keys
      .map((key) => {
        const label =
          key === GENERAL_THREAD_KEY
            ? 'general'
            : (MOCK_SNIPPETS.find((s) => s.id === key)?.selectedText ?? key);
        return `${label}:${messagesByThread[key]?.length ?? 0}`;
      })
      .join(' · ');
  }, [messagesByThread]);

  return {
    variant,
    snippets: MOCK_SNIPPETS,
    selectedSnippetId,
    selectedSnippet,
    selectSnippet: (id: string | null) => {
      setSelectedSnippetId(id);
      setExpandedCardId(null);
    },
    chatOpen,
    setChatOpen,
    toggleChat: () => setChatOpen((open) => !open),
    expandedCardId,
    expandedCard,
    expandCard: (id: string | null) =>
      setExpandedCardId((current) => (current === id ? null : id)),
    cardsForSnippet,
    cardListModalOpen,
    setCardListModalOpen,
    draft,
    setDraft,
    sendMessage,
    activeThreadKey,
    activeMessages,
    contextLabel,
    suggestedPrompts: SUGGESTED_PROMPTS,
    stateSummary: [
      `thread=${activeThreadKey}`,
      `msgs=${activeMessages.length}`,
      `chat=${chatOpen ? 'open' : 'closed'}`,
      `card=${expandedCardId ?? 'none'}`,
      threadSummaries ? `all[${threadSummaries}]` : 'all[]',
    ].join(' · '),
  };
}

export type SnippetChatPrototypeState = ReturnType<
  typeof useSnippetChatPrototypeState
>;
