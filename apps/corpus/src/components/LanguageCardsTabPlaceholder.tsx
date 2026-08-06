import type { CorpusSnippet } from '../types/corpus';

type LanguageCardsTabPlaceholderProps = {
  snippet: CorpusSnippet | undefined;
};

export function LanguageCardsTabPlaceholder({
  snippet,
}: LanguageCardsTabPlaceholderProps) {
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
      <header className="mb-4">
        <p className="text-[10px] font-medium uppercase tracking-wide text-text-muted">
          Language cards
        </p>
        <h2 className="mt-1 font-display text-base font-semibold text-text">
          Card builder coming soon
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          Draft editor, field slots, and Create will land here. For now, use the
          Snip cards tab to read the capture note.
        </p>
      </header>
      <div className="rounded-xl border border-dashed border-border bg-canvas px-4 py-8 text-center text-sm text-text-muted">
        Placeholder shell for capture:{' '}
        <span className="font-medium text-text">{snippet.selectedText}</span>
      </div>
    </div>
  );
}
