import { useState } from 'react';
import { InboxIcon, LibraryIcon } from '../../components/SemiaNavIcons';
import { DARK_MODE_INBOX_SNIPPETS } from './darkModeMockData';

export function DarkModeInboxPreview() {
  const [selectedId, setSelectedId] = useState(DARK_MODE_INBOX_SNIPPETS[1]?.id ?? 's1');
  const selected = DARK_MODE_INBOX_SNIPPETS.find((s) => s.id === selectedId);

  return (
    <div className="flex h-full min-h-0 overflow-hidden">
      <aside className="flex w-[220px] shrink-0 flex-col border-r border-border bg-shelf">
        <header className="border-b border-border px-4 py-4">
          <h1 className="font-display text-lg font-semibold text-text">SEMIA</h1>
          <p className="mt-1 text-[11px] text-text-muted">Prototype · dark inbox</p>
        </header>
        <nav className="flex-1 space-y-1 p-2">
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md bg-accent-soft px-2 py-2 text-sm text-accent"
          >
            <InboxIcon size={14} />
            Inbox
            <span className="ml-auto text-[10px] tabular-nums">5</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-text-secondary hover:bg-canvas"
          >
            <LibraryIcon size={14} />
            Library
          </button>
        </nav>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col bg-canvas">
        <header className="border-b border-border bg-surface/80 px-5 py-4">
          <p className="text-[10px] font-medium uppercase tracking-wide text-text-muted">
            Inbox queue
          </p>
          <h2 className="font-display text-base font-semibold text-text">
            All pending captures
          </h2>
        </header>
        <ul className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {DARK_MODE_INBOX_SNIPPETS.map((snippet) => {
            const active = snippet.id === selectedId;
            return (
              <li key={snippet.id} className="mb-1">
                <div
                  className={[
                    'flex items-center gap-2 rounded-lg border px-2 py-1.5',
                    active
                      ? 'border-accent/40 bg-accent-soft'
                      : 'border-transparent hover:bg-surface',
                  ].join(' ')}
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 rounded-md px-2 py-1.5 text-left"
                    onClick={() => setSelectedId(snippet.id)}
                  >
                    <span className="block truncate text-sm font-medium text-text">
                      {snippet.selectedText}
                    </span>
                    <span className="block truncate text-[11px] text-text-muted">
                      {snippet.sourceTitle}
                    </span>
                  </button>
                  {snippet.cardCount > 0 ? (
                    <span className="semia-badge-cards shrink-0">{snippet.cardCount}</span>
                  ) : null}
                  <button
                    type="button"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-600/40 text-emerald-400 hover:bg-emerald-950/40"
                    aria-label="Mark processed"
                  >
                    ✓
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <aside className="flex w-[min(380px,38vw)] shrink-0 flex-col border-l border-border bg-surface">
        <header className="flex border-b border-border px-4 py-3">
          <span className="rounded-md bg-accent-soft px-2 py-1 text-xs font-medium text-accent">
            Snip cards
          </span>
          <span className="ml-2 rounded-md px-2 py-1 text-xs text-text-muted">
            Language cards
          </span>
        </header>
        <div className="flex-1 overflow-y-auto p-4">
          {selected ? (
            <>
              <p className="font-reading text-lg text-text">{selected.selectedText}</p>
              <p className="mt-2 text-sm text-text-secondary">
                Natural translation preview — meaning would appear here in the real
                note.
              </p>
              <div className="semia-context-collapsed mt-4 p-3 text-xs text-text-muted">
                Context window collapsed preview…
              </div>
            </>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
