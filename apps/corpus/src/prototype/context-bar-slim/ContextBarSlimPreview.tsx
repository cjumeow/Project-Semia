import { useState } from 'react';
import { SLIM_MOCK_MESSAGES, SLIM_MOCK_SNIPPETS } from './contextBarSlimMockData';
import {
  SlimContextBar,
  SlimContextSwitchLine,
} from './contextBarSlimVariantComponents';
import type { ContextBarSlimVariantKey } from './contextBarSlimVariants';

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden>
      <path
        d="M4.5 4.5l7 7M11.5 4.5l-7 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

type ContextBarSlimPreviewProps = {
  variant: ContextBarSlimVariantKey;
  theme: 'light' | 'dark';
};

export function ContextBarSlimPreview({
  variant,
  theme,
}: ContextBarSlimPreviewProps) {
  const [activeSnippetId, setActiveSnippetId] = useState(SLIM_MOCK_SNIPPETS[0]!.id);

  return (
    <div
      className="mx-auto flex h-[min(640px,calc(100vh-10rem))] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-xl"
      data-semia-theme={theme === 'dark' ? 'dark' : undefined}
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <div className="min-w-0">
          <p className="font-display text-sm font-semibold text-text">AI assistant</p>
          <p className="text-[11px] text-text-muted">Global thread</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex rounded-md border border-border bg-canvas p-0.5 text-[10px]">
            <span className="rounded bg-surface px-2 py-0.5 font-medium text-text shadow-sm">
              Read
            </span>
            <span className="rounded px-2 py-0.5 text-text-muted">Drag</span>
          </div>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary hover:bg-canvas"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>
      </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 pt-0">
        <SlimContextBar
          variant={variant}
          snippets={SLIM_MOCK_SNIPPETS}
          activeSnippetId={activeSnippetId}
          onSelectSnippet={setActiveSnippetId}
        />

        <ul className="flex flex-col gap-3">
          {SLIM_MOCK_MESSAGES.map((message, index) => {
            if (message.kind === 'switch') {
              const snippet = SLIM_MOCK_SNIPPETS.find(
                (entry) => entry.id === message.snippetId,
              );
              if (!snippet) return null;
              return (
                <SlimContextSwitchLine
                  key={`switch-${index}`}
                  variant={variant}
                  text={snippet.selectedText}
                />
              );
            }

            if (message.kind === 'user') {
              return (
                <li
                  key={`user-${index}`}
                  className="ml-auto max-w-[92%] rounded-xl bg-accent px-3 py-2 text-sm leading-relaxed text-white"
                >
                  {message.content}
                </li>
              );
            }

            return (
              <li
                key={`assistant-${index}`}
                className="max-w-[92%] rounded-xl bg-canvas px-3 py-2 text-sm text-text"
              >
                <div className="prose-chat whitespace-pre-wrap text-sm leading-snug">
                  {message.content}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <form className="flex shrink-0 gap-2 border-t border-border p-3">
        <input
          type="text"
          readOnly
          placeholder="Ask anything…"
          className="min-w-0 flex-1 rounded-lg border border-border bg-canvas px-3 py-2 text-sm placeholder:text-text-muted"
        />
        <button
          type="button"
          className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
