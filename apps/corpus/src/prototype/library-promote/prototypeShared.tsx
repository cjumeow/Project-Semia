import type { ReactNode } from 'react';
import { NoteCard } from '../../components/NoteCard';
import { TriageStatusIcon } from '../../components/TriageStatusIcon';
import type { CorpusSnippet } from '../../types/corpus';
import { effectiveTriageStatus } from '../../utils/corpusGrouping';
import type { LibraryPromotePrototypeState } from './useLibraryPromotePrototypeState';

export function PrototypeLayout({
  state,
  variantLabel,
  renderNoteCard,
}: {
  state: LibraryPromotePrototypeState;
  variantLabel: string;
  renderNoteCard: (snippet: CorpusSnippet) => ReactNode;
}) {
  const { snippets, selectedId, selectSnippet } = state;
  const selectedSnippet =
    snippets.find((snippet) => snippet.id === selectedId) ?? null;

  return (
    <div className="flex min-h-0 flex-1">
      <section className="flex w-[42%] min-w-0 flex-col border-r border-border bg-canvas">
        <header className="shrink-0 border-b border-border bg-surface/80 px-5 py-4">
          <h2 className="font-display text-base font-semibold text-text">
            Immersion learning tips
          </h2>
          <p className="mt-1 text-xs text-text-muted">Language Coach</p>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <h3 className="semia-section-label mb-2">Selections</h3>
          <ul className="flex flex-col gap-1" role="listbox">
            {snippets.map((snippet) => {
              const triageStatus = effectiveTriageStatus(snippet);
              const isActive = snippet.id === selectedId;
              return (
                <li key={snippet.id} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    className={[
                      'flex w-full items-center gap-3 rounded-md border-l-[3px] border-transparent py-2.5 pl-[calc(0.75rem-3px)] pr-3 text-left transition-colors',
                      isActive
                        ? 'semia-margin-active text-text'
                        : 'text-text-secondary hover:bg-surface/60 hover:text-text',
                    ].join(' ')}
                    onClick={() => selectSnippet(snippet.id)}
                  >
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {snippet.selectedText}
                    </span>
                    <TriageStatusIcon status={triageStatus} size={16} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-surface">
        {selectedSnippet ? (
          <>
            <header className="sticky top-0 z-10 border-b border-border bg-surface/95 px-5 py-4 backdrop-blur-sm">
              <h2 className="font-reading text-xl font-semibold leading-snug text-text">
                {selectedSnippet.selectedText}
              </h2>
            </header>
            <div className="p-5">{renderNoteCard(selectedSnippet)}</div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center px-6">
            <p className="text-sm text-text-muted">Select a snippet.</p>
          </div>
        )}
      </section>

      <footer className="pointer-events-none fixed bottom-16 inset-x-0 z-50 mx-auto max-w-2xl px-4">
        <p className="rounded-lg border border-amber-200/80 bg-amber-50/90 px-3 py-2 font-mono text-[10px] leading-relaxed text-amber-950">
          <span className="font-semibold">{variantLabel}</span>
          <span className="text-amber-900/80"> · {state.stateSummary}</span>
        </p>
      </footer>
    </div>
  );
}

export function MockNoteCard({ snippet }: { snippet: CorpusSnippet }) {
  return (
    <NoteCard
      note={snippet.note}
      highlightSelection={
        snippet.note.originalSpeech.trim() || snippet.selectedText
      }
    />
  );
}

export function isReviewSnippet(snippet: CorpusSnippet): boolean {
  return effectiveTriageStatus(snippet) === 'review';
}
