import { SNIPPET_CHAT_SUGGESTED_PROMPTS } from '@semia/shared';
import { useLayoutEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { TextDots } from './TextDots';
import type { SnippetChatMessage, UseSnippetChatResult } from '../hooks/useSnippetChat';

type SnippetChatPanelProps = {
  chat: UseSnippetChatResult;
  onClose: () => void;
};

function AssistantChatMarkdown({
  message,
}: {
  message: SnippetChatMessage;
}) {
  if (!message.content && message.streaming) {
    return (
      <span className="text-text-muted">
        <TextDots>Thinking</TextDots>
      </span>
    );
  }

  return (
    <div className="prose-chat text-sm leading-snug text-text">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children }) => (
            <div className="prose-chat-table-wrap">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {message.content}
      </ReactMarkdown>
      {message.streaming ? (
        <span
          aria-hidden
          className="ml-0.5 inline-block h-[1em] w-0.5 animate-pulse bg-text-muted align-[-0.1em]"
        />
      ) : null}
    </div>
  );
}

export function SnippetChatPanel({ chat, onClose }: SnippetChatPanelProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [chat.threadKey]);

  return (
    <div className="absolute inset-0 z-10 flex flex-col bg-surface">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <p className="font-display text-sm font-semibold text-text">AI assistant</p>
          <p className="truncate text-[11px] text-text-muted">
            context:{' '}
            <span className="text-text-secondary">{chat.contextLabel}</span>
          </p>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-md border border-border px-2.5 py-1 text-xs text-text-secondary transition-colors hover:bg-canvas hover:text-text"
          onClick={onClose}
        >
          Close chat
        </button>
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
                className={[
                  'max-w-[92%] rounded-xl px-3 py-2 text-sm',
                  message.role === 'user'
                    ? 'ml-auto whitespace-pre-wrap bg-accent leading-relaxed text-white'
                    : 'bg-canvas text-text',
                ].join(' ')}
              >
                {message.role === 'user' ? (
                  message.content
                ) : (
                  <AssistantChatMarkdown message={message} />
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
