import type { CorpusSnippet } from '../types/corpus';
import { reviewScheduleMeta } from '../utils/corpusGrouping';
import { NoteCard } from './NoteCard';

type ReviewQueueWorkspaceProps = {
  dueSnippets: CorpusSnippet[];
  selectedSnippet: CorpusSnippet | undefined;
  actionsEnabled: boolean;
  generating?: boolean;
  noteError?: string | null;
  generatingContext?: boolean;
  contextError?: string | null;
  contextWindowEnabled?: boolean;
  onSelectSnippet: (snippetId: string) => void;
  onStillLearning: (snippetId: string) => void;
  onMastered: (snippetId: string) => void;
  onOpenSettings?: () => void;
  languageCardCount?: number;
  onCreateLanguageCard?: () => void;
  createLanguageCardEnabled?: boolean;
};

export function ReviewQueueWorkspace({
  dueSnippets,
  selectedSnippet,
  actionsEnabled,
  generating,
  noteError,
  generatingContext,
  contextError,
  onSelectSnippet,
  onStillLearning,
  onMastered,
  contextWindowEnabled,
  onOpenSettings,
  languageCardCount,
  onCreateLanguageCard,
  createLanguageCardEnabled,
}: ReviewQueueWorkspaceProps) {
  const now = new Date().toISOString();
  const focusIndex = selectedSnippet
    ? dueSnippets.findIndex((snippet) => snippet.id === selectedSnippet.id)
    : -1;

  if (dueSnippets.length === 0) {
    return (
      <section className="flex min-h-0 min-w-0 flex-1 items-center justify-center bg-canvas px-6">
        <p className="text-center text-sm text-text-muted">
          Nothing due in your Review Queue — check back later.
        </p>
      </section>
    );
  }

  if (!selectedSnippet || focusIndex < 0) {
    return (
      <section className="flex min-h-0 min-w-0 flex-1 items-center justify-center bg-canvas px-6">
        <p className="text-center text-sm text-text-muted">
          Select a due snippet from Review Queue.
        </p>
      </section>
    );
  }

  const schedule = reviewScheduleMeta(selectedSnippet, now);

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-canvas">
      <div className="shrink-0 px-6 pt-6">
        <div className="flex items-center gap-2">
          {dueSnippets.map((snippet, index) => (
            <button
              key={snippet.id}
              type="button"
              className={[
                'h-2 rounded-full transition-all',
                index === focusIndex
                  ? 'w-6 bg-accent'
                  : 'w-2 bg-border hover:bg-text-muted',
              ].join(' ')}
              aria-label={`Go to ${snippet.selectedText}`}
              onClick={() => onSelectSnippet(snippet.id)}
            />
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 pb-4">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-reading text-center text-3xl font-semibold leading-snug tracking-tight text-text">
            {selectedSnippet.selectedText}
          </h2>
          <p className="mt-2 text-center text-xs text-text-muted">
            {selectedSnippet.sourceTitle}
          </p>
          {noteError ? (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {noteError}
            </p>
          ) : null}
          <div className="mt-6">
            <NoteCard
              note={selectedSnippet.note}
              highlightSelection={
                selectedSnippet.note.originalSpeech.trim() ||
                selectedSnippet.selectedText
              }
              generating={generating}
              generatingContext={generatingContext}
              contextError={contextError}
              contextWindowEnabled={contextWindowEnabled}
              onOpenSettings={onOpenSettings}
              languageCardCount={languageCardCount}
              onCreateLanguageCard={onCreateLanguageCard}
              createLanguageCardEnabled={createLanguageCardEnabled}
            />
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-border bg-shelf/80 px-5 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text">
              {selectedSnippet.selectedText}
            </p>
            <p className="truncate text-[11px] text-text-muted">
              {focusIndex + 1}/{dueSnippets.length} · Stage {schedule.stageLabel}
              {schedule.overdueDays
                ? ` · ${schedule.overdueDays}d overdue`
                : ''}
              {(languageCardCount ?? 0) > 0 ? (
                <>
                  {' '}
                  · {languageCardCount} language card
                  {languageCardCount === 1 ? '' : 's'}
                </>
              ) : null}
            </p>
          </div>
          <div className="flex w-[min(20rem,48vw)] shrink-0 gap-3">
            <button
              type="button"
              disabled={!actionsEnabled}
              className="min-w-0 flex-1 rounded-xl border border-[#8B7355]/40 bg-[#F5EDE4] px-4 py-3.5 text-sm font-medium text-[#5C4A32] transition-colors hover:bg-[#EBE0D4] disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => onStillLearning(selectedSnippet.id)}
            >
              Still learning
            </button>
            <button
              type="button"
              disabled={!actionsEnabled}
              className="min-w-0 flex-1 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm font-medium text-emerald-800 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => onMastered(selectedSnippet.id)}
            >
              Mastered
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
