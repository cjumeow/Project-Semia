import type { CorpusSnippet } from '../types/corpus';
import { formatTimestamp } from '../utils/youtubeUrl';

type SelectionListProps = {
  snippets: CorpusSnippet[];
  selectedSnippetId: string | null;
  onSelectSnippet: (snippetId: string) => void;
};

export function SelectionList({
  snippets,
  selectedSnippetId,
  onSelectSnippet,
}: SelectionListProps) {
  if (snippets.length === 0) {
    return (
      <p className="px-1 py-2 text-sm text-text-muted">
        No captures for this video yet.
      </p>
    );
  }

  return (
    <ul
      className="flex flex-col gap-1"
      role="listbox"
      aria-label="Captured selections"
    >
      {snippets.map((snippet) => {
        const isActive = snippet.id === selectedSnippetId;
        return (
          <li key={snippet.id} role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={isActive}
              className={[
                'flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors',
                isActive
                  ? 'border-accent/30 bg-accent-soft text-text'
                  : 'border-transparent bg-canvas text-text-secondary hover:border-border hover:bg-surface',
              ].join(' ')}
              onClick={() => onSelectSnippet(snippet.id)}
            >
              <span className="shrink-0 font-mono text-xs tabular-nums text-text-muted">
                {formatTimestamp(snippet.start)}
              </span>
              <span className="truncate text-sm font-medium">
                {snippet.selectedText}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
