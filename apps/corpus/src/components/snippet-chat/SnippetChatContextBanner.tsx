import { useEffect, useRef, useState } from 'react';
import { ChatContextChevron } from './ChatContextChevron';

export type SnippetChatContextOption = {
  id: string;
  selectedText: string;
};

type SnippetChatContextBannerProps = {
  snippets: SnippetChatContextOption[];
  activeSnippetId: string | null;
  onSelectSnippet: (snippetId: string) => void;
};

export function SnippetChatContextBanner({
  snippets,
  activeSnippetId,
  onSelectSnippet,
}: SnippetChatContextBannerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const active =
    snippets.find((snippet) => snippet.id === activeSnippetId) ?? snippets[0];

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [open]);

  if (snippets.length === 0 || !active) {
    return null;
  }

  return (
    <div className="sticky top-0 z-10 bg-surface/80 px-3 py-1.5 backdrop-blur-sm">
      <div
        ref={rootRef}
        className="relative inline-flex w-fit max-w-[85%] min-w-0 items-center"
      >
        <button
          type="button"
          className="semia-chat-context-bar-pill inline-flex h-7 w-fit max-w-full min-w-0 items-center gap-1.5 rounded-full border border-border bg-canvas/90 px-2.5 text-left transition-colors hover:border-accent/30"
          aria-expanded={open}
          aria-haspopup="listbox"
          onClick={() => setOpen((current) => !current)}
        >
          <ChatContextChevron expanded={open} />
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="shrink-0 text-[10px] font-medium text-text-muted">
              Context
            </span>
            <span className="shrink-0 text-[10px] text-text-muted/40" aria-hidden>
              |
            </span>
            <span className="min-w-0 truncate text-xs text-text-secondary">
              {active.selectedText}
            </span>
          </span>
        </button>

        {open ? (
          <div
            className="semia-chat-context-picker absolute left-0 top-full z-30 mt-1 w-full min-w-[14rem] rounded-lg border border-border bg-surface p-2 shadow-lg"
            role="listbox"
            aria-label="Switch context"
          >
            <ul className="max-h-48 overflow-y-auto">
              {snippets.map((snippet) => {
                const selected = snippet.id === activeSnippetId;
                return (
                  <li key={snippet.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      className={[
                        'w-full rounded-md px-2 py-1.5 text-left text-xs font-reading transition-colors',
                        selected
                          ? 'bg-accent-soft text-text'
                          : 'text-text-secondary hover:bg-canvas hover:text-text',
                      ].join(' ')}
                      onClick={() => {
                        onSelectSnippet(snippet.id);
                        setOpen(false);
                      }}
                    >
                      {snippet.selectedText}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
