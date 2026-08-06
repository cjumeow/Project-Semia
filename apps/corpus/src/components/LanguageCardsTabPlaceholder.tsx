import type { CorpusSnippet } from '../types/corpus';
import { useLanguageCardDraft } from '../hooks/useLanguageCardDraft';

type LanguageCardsTabPlaceholderProps = {
  snippet: CorpusSnippet | undefined;
};

function saveStateLabel(
  saveState: 'idle' | 'saving' | 'saved' | 'error',
): string {
  switch (saveState) {
    case 'saving':
      return 'Saving draft…';
    case 'saved':
      return 'Draft saved';
    case 'error':
      return 'Could not save draft';
    default:
      return 'Draft auto-saves';
  }
}

export function LanguageCardsTabPlaceholder({
  snippet,
}: LanguageCardsTabPlaceholderProps) {
  const { draft, loaded, saveState, updateDraft } = useLanguageCardDraft(
    snippet?.id,
  );

  if (!snippet) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-center text-sm text-text-muted">
          Select a capture to build language cards.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-5">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-text-muted">
            Language cards
          </p>
          <h2 className="mt-1 font-display text-base font-semibold text-text">
            Draft
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            One draft per capture. Full editor UI lands in a follow-up ticket;
            changes here persist with 300ms auto-save.
          </p>
        </div>
        <p className="shrink-0 text-[10px] text-text-muted">
          {loaded ? saveStateLabel(saveState) : 'Loading draft…'}
        </p>
      </header>

      <div className="space-y-4">
        <label className="block">
          <span className="text-xs font-medium text-text-secondary">Focus</span>
          <input
            type="text"
            className="mt-1 w-full rounded-lg border border-border bg-canvas px-3 py-2 text-sm text-text"
            value={draft.focusText}
            disabled={!loaded}
            onChange={(event) => {
              updateDraft({ focusText: event.target.value });
            }}
            placeholder="Word or phrase from the capture"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-text-secondary">Meaning</span>
          <textarea
            className="mt-1 min-h-24 w-full rounded-lg border border-border bg-canvas px-3 py-2 text-sm text-text"
            value={draft.meaning}
            disabled={!loaded}
            onChange={(event) => {
              updateDraft({ meaning: event.target.value });
            }}
            placeholder="Explanation in your native language"
          />
        </label>
      </div>
    </div>
  );
}
