import { SNIPPET_CHAT_SUGGESTED_PROMPTS } from '@semia/shared';
import { useEffect, useRef } from 'react';
import { TextDots } from './TextDots';
import type { UseSnippetChatResult } from '../hooks/useSnippetChat';

type SnippetChatPanelProps = {
  chat: UseSnippetChatResult;
  onClose: () => void;
};

export function SnippetChatPanel({ chat, onClose }: SnippetChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.activeMessages.length, chat.sending]);

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
          className="shrink-0 text-xs text-text-muted hover:text-text"
          onClick={onClose}
        >
          Close
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
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
                  'max-w-[92%] rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap',
                  message.role === 'user'
                    ? 'ml-auto bg-accent text-white'
                    : 'bg-canvas text-text',
                ].join(' ')}
              >
                {message.content}
              </li>
            ))}
          </ul>
        )}
        {chat.sending ? (
          <p className="mt-3 text-sm text-text-muted">
            <TextDots>Thinking</TextDots>
          </p>
        ) : null}
        <div ref={bottomRef} />
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

type SnippetChatFabProps = {
  open: boolean;
  onClick: () => void;
};

export function SnippetChatFab({ open, onClick }: SnippetChatFabProps) {
  return (
    <button
      type="button"
      className={[
        'absolute bottom-5 right-5 z-20 flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium shadow-lg transition-colors',
        open
          ? 'border border-border bg-surface text-text-secondary hover:text-text'
          : 'bg-accent text-white hover:bg-accent/90',
      ].join(' ')}
      onClick={onClick}
    >
      {open ? 'Close chat' : 'AI assistant'}
    </button>
  );
}
