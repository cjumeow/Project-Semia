import { isYouTubeAnchor } from '@semia/shared';
import type { CorpusSnippet } from '../types/corpus';
import { snippetSeekSeconds } from '../utils/corpusGrouping';
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
        No captures for this source yet.
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
        const seekSeconds = snippetSeekSeconds(snippet);
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
                  : 'border-transparent bg-transparent text-text-secondary hover:bg-surface/60 hover:text-text',
              ].join(' ')}
              onClick={() => onSelectSnippet(snippet.id)}
            >
              {isYouTubeAnchor(snippet.anchor) && seekSeconds !== undefined ? (
                <span className="shrink-0 font-mono text-xs tabular-nums text-text-muted">
                  {formatTimestamp(seekSeconds)}
                </span>
              ) : (
                <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-text-muted">
                  Web
                </span>
              )}
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
