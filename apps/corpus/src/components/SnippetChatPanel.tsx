import { SNIPPET_CHAT_SUGGESTED_PROMPTS } from '@semia/shared';
import { useLayoutEffect, useRef } from 'react';
import { useSemiaSettings } from '../hooks/useSemiaSettings';
import type { UseSnippetChatResult } from '../hooks/useSnippetChat';
import {
  SnippetChatContextSwitcher,
  type SnippetChatContextOption,
} from './SnippetChatContextSwitcher';
import { DraggableAssistantMarkdown } from './snippet-chat/DraggableAssistantMarkdown';
import { SnippetChatDragModeProvider } from './snippet-chat/SnippetChatDragModeContext';
import { SnippetChatDragModeToggle } from './snippet-chat/SnippetChatDragModeToggle';

type SnippetChatPanelProps = {
  chat: UseSnippetChatResult;
  onClose: () => void;
  contextSnippets?: SnippetChatContextOption[];
  activeContextSnippetId?: string | null;
  onSelectContextSnippet?: (snippetId: string) => void;
};

export function SnippetChatPanel({
  chat,
  onClose,
  contextSnippets,
  activeContextSnippetId,
  onSelectContextSnippet,
}: SnippetChatPanelProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { snippetChatDragModeEnabled, setSnippetChatDragModeEnabled } =
    useSemiaSettings();

  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [chat.activeMessages.length, chat.threadKey]);

  const showContextSwitcher =
    contextSnippets &&
    contextSnippets.length > 0 &&
    onSelectContextSnippet;

  return (
    <SnippetChatDragModeProvider enabled={snippetChatDragModeEnabled}>
      <div className="absolute inset-0 z-10 flex flex-col bg-surface shadow-xl">
        <header className="relative flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <p className="font-display text-sm font-semibold text-text">AI assistant</p>
          <p className="truncate text-[11px] text-text-muted">
            {chat.globalThread ? 'Global thread' : 'Per-capture thread'}
            {chat.hasSnippetContext ? (
              <>
                {' '}
                · grounding:{' '}
                <span className="text-text-secondary">{chat.contextLabel}</span>
              </>
            ) : null}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <SnippetChatDragModeToggle
            enabled={snippetChatDragModeEnabled}
            onChange={(enabled) => {
              void setSnippetChatDragModeEnabled(enabled);
            }}
          />
          {showContextSwitcher ? (
            <SnippetChatContextSwitcher
              snippets={contextSnippets}
              activeSnippetId={activeContextSnippetId ?? null}
              onSelectSnippet={onSelectContextSnippet}
            />
          ) : null}
          <button
            type="button"
            className="shrink-0 rounded-md border border-border px-2.5 py-1 text-xs text-text-secondary transition-colors hover:bg-canvas hover:text-text"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        </header>

        <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {chat.activeMessages.length === 0 ? (
          <p className="text-sm text-text-muted">
            {chat.hasSnippetContext
              ? 'Ask about this snippet — note and context are attached automatically.'
              : 'General tutor mode. Select a snippet to attach capture context.'}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {chat.activeMessages.map((message) => (
              <li
                key={message.id}
                className={
                  message.kind === 'context-switch'
                    ? 'mx-auto max-w-md rounded-lg border border-border bg-canvas px-3 py-2 text-center text-[11px] text-text-muted'
                    : [
                        'max-w-[92%] rounded-xl px-3 py-2 text-sm',
                        message.role === 'user'
                          ? 'ml-auto whitespace-pre-wrap bg-accent leading-relaxed text-white'
                          : 'bg-canvas text-text',
                      ].join(' ')
                }
              >
                {message.kind === 'context-switch' ? (
                  message.content
                ) : message.role === 'user' ? (
                  message.content
                ) : (
                  <DraggableAssistantMarkdown message={message} />
                )}
              </li>
            ))}
          </ul>
        )}
        </div>

        {chat.error ? (
          <p className="shrink-0 border-t border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {chat.error}
          </p>
        ) : null}

        {chat.hasSnippetContext ? (
          <div className="flex shrink-0 flex-wrap gap-2 border-t border-border px-4 py-2">
            {SNIPPET_CHAT_SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={chat.sending}
                className="rounded-full border border-border bg-surface px-3 py-1 text-[11px] text-text-secondary transition-colors hover:border-accent/30 disabled:opacity-50"
                onClick={() => {
                  void chat.sendMessage(prompt);
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        ) : null}

        <form
          className="flex shrink-0 gap-2 border-t border-border p-4"
          onSubmit={(event) => {
            event.preventDefault();
            void chat.sendMessage(chat.draft);
          }}
        >
          <input
            type="text"
            value={chat.draft}
            placeholder="Ask anything…"
            disabled={chat.sending}
            className="min-w-0 flex-1 rounded-lg border border-border bg-canvas px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-50"
            onChange={(event) => chat.setDraft(event.target.value)}
          />
          <button
            type="submit"
            disabled={chat.sending || !chat.draft.trim()}
            className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </SnippetChatDragModeProvider>
  );
}

export function SnippetChatFab({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="absolute bottom-5 right-5 z-20 flex h-11 items-center gap-2 rounded-full bg-accent px-4 text-sm font-medium text-white shadow-lg transition-colors hover:bg-accent/90"
      onClick={onClick}
    >
      AI assistant
    </button>
  );
}
