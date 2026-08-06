import { useState } from 'react';

export type SnippetChatContextOption = {
  id: string;
  selectedText: string;
};

type SnippetChatContextSwitcherProps = {
  snippets: SnippetChatContextOption[];
  activeSnippetId: string | null;
  onSelectSnippet: (snippetId: string) => void;
};

export function SnippetChatContextSwitcher({
  snippets,
  activeSnippetId,
  onSelectSnippet,
}: SnippetChatContextSwitcherProps) {
  const [open, setOpen] = useState(false);
  const activeSnippet =
    snippets.find((snippet) => snippet.id === activeSnippetId) ?? snippets[0];

  if (snippets.length === 0) {
    return null;
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        className={[
          'flex max-w-[11rem] items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors',
          open
            ? 'border-accent/40 bg-accent-soft text-accent'
            : 'border-border bg-canvas text-text-secondary hover:bg-surface hover:text-text',
        ].join(' ')}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        <span className="shrink-0 font-medium">Context</span>
        <span className="min-w-0 truncate">
          {activeSnippet?.selectedText ?? 'Select capture'}
        </span>
        <span className="shrink-0 text-[10px] opacity-70" aria-hidden>
          {open ? '▴' : '▾'}
        </span>
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+6px)] z-30 w-60 rounded-xl border border-border bg-surface p-2.5 shadow-xl">
          <p className="text-[10px] font-medium uppercase tracking-wide text-text-muted">
            Switch context
          </p>
          <ul className="mt-1.5 max-h-48 overflow-y-auto">
            {snippets.map((snippet) => {
              const active = snippet.id === activeSnippetId;
              return (
                <li key={snippet.id}>
                  <button
                    type="button"
                    className={[
                      'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors',
                      active
                        ? 'bg-accent-soft text-accent'
                        : 'text-text-secondary hover:bg-canvas hover:text-text',
                    ].join(' ')}
                    onClick={() => {
                      onSelectSnippet(snippet.id);
                      setOpen(false);
                    }}
                  >
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {snippet.selectedText}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
