import { isYouTubeAnchor } from '@semia/shared';
import type { ReactNode } from 'react';
import type { CorpusSnippet } from '../types/corpus';
import {
  effectiveTriageStatus,
  snippetSeekSeconds,
} from '../utils/corpusGrouping';
import { formatTimestamp } from '../utils/youtubeUrl';
import { TriageStatusIcon } from './TriageStatusIcon';

type SelectionListProps = {
  snippets: CorpusSnippet[];
  selectedSnippetId: string | null;
  onSelectSnippet: (snippetId: string) => void;
  showSourceSubtitle?: boolean;
  showMediaLabel?: boolean;
  showStatusIcon?: boolean;
  inlineTriage?: {
    onMarkReview: (snippetId: string) => void;
    onMarkMastered: (snippetId: string) => void;
  };
  emptyMessage?: string;
};

export function SelectionList({
  snippets,
  selectedSnippetId,
  onSelectSnippet,
  showSourceSubtitle = false,
  showMediaLabel = true,
  showStatusIcon = false,
  inlineTriage,
  emptyMessage = 'No captures for this source yet.',
}: SelectionListProps) {
  if (snippets.length === 0) {
    return (
      <p className="px-1 py-2 text-sm text-text-muted">{emptyMessage}</p>
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
        const triageStatus = effectiveTriageStatus(snippet);
        const showInlineActions =
          inlineTriage && triageStatus === 'pending';

        return (
          <li key={snippet.id} role="presentation">
            <div
              className={[
                'flex items-center gap-1 rounded-md border-l-[3px] border-transparent',
                isActive ? 'semia-margin-active' : '',
              ].join(' ')}
            >
              <button
                type="button"
                role="option"
                aria-selected={isActive}
                className={[
                  'flex min-w-0 flex-1 items-center gap-3 py-2.5 pl-[calc(0.75rem-3px)] pr-2 text-left transition-colors',
                  isActive
                    ? 'text-text'
                    : 'text-text-secondary hover:bg-surface/60 hover:text-text',
                ].join(' ')}
                onClick={() => onSelectSnippet(snippet.id)}
              >
                {showMediaLabel ? (
                  isYouTubeAnchor(snippet.anchor) &&
                  seekSeconds !== undefined ? (
                    <span className="shrink-0 font-mono text-xs tabular-nums text-text-muted">
                      {formatTimestamp(seekSeconds)}
                    </span>
                  ) : (
                    <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-text-muted">
                      Web
                    </span>
                  )
                ) : null}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {snippet.selectedText}
                  </span>
                  {showSourceSubtitle ? (
                    <span className="block truncate text-[11px] text-text-muted">
                      {snippet.sourceTitle}
                    </span>
                  ) : null}
                </span>
                {showStatusIcon ? (
                  <TriageStatusIcon status={triageStatus} size={16} />
                ) : null}
              </button>

              {showInlineActions ? (
                <div className="flex shrink-0 items-center gap-1 pr-2">
                  <IconTriageButton
                    label="Mark as review"
                    onClick={() => inlineTriage.onMarkReview(snippet.id)}
                  >
                    <TriageStatusIcon status="review" size={14} />
                  </IconTriageButton>
                  <IconTriageButton
                    label="Mark as mastered"
                    onClick={() => inlineTriage.onMarkMastered(snippet.id)}
                  >
                    <TriageStatusIcon status="mastered" size={14} />
                  </IconTriageButton>
                </div>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function IconTriageButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface transition-colors hover:bg-canvas"
      aria-label={label}
      title={label}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      {children}
    </button>
  );
}
