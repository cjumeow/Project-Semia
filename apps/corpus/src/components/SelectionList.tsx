import { isYouTubeAnchor, reviewScheduleListMeta } from '@semia/shared';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { CorpusSnippet } from '../types/corpus';
import {
  effectiveTriageStatus,
  snippetSeekSeconds,
} from '../utils/corpusGrouping';
import { formatTimestamp } from '../utils/youtubeUrl';
import { reviewScheduleBadgeClass } from '../utils/semiaUi';
import { CardCountBadge } from './CardCountBadge';
import { TriageStatusIcon } from './TriageStatusIcon';
import {
  pruneHiddenAfterExitIds,
  visibleTriageSnippets,
} from './selectionListTriage';
import type { InboxProcessTrigger, InboxTriageAction } from './inboxTriageTypes';

type SelectionListProps = {
  snippets: CorpusSnippet[];
  selectedSnippetId: string | null;
  onSelectSnippet: (snippetId: string) => void;
  showSourceSubtitle?: boolean;
  showMediaLabel?: boolean;
  showStatusIcon?: boolean;
  cardCountForSnippet?: (snippetId: string) => number;
  inlineTriage?: {
    onRequestProcess: (snippetId: string) => void;
    onProcessComplete: (snippetId: string) => void;
    onDelete: (snippetId: string) => void;
    onExitStart?: (snippetId: string) => void;
    processTrigger?: InboxProcessTrigger | null;
    onProcessTriggerConsumed?: () => void;
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
  cardCountForSnippet,
  inlineTriage,
  emptyMessage = 'No captures for this source yet.',
}: SelectionListProps) {
  const exitingActionsRef = useRef(new Map<string, InboxTriageAction>());
  const [exitingIds, setExitingIds] = useState<Set<string>>(() => new Set());
  const [hiddenAfterExitIds, setHiddenAfterExitIds] = useState<Set<string>>(
    () => new Set(),
  );

  const visibleSnippets = useMemo(
    () => visibleTriageSnippets(snippets, hiddenAfterExitIds),
    [hiddenAfterExitIds, snippets],
  );

  const beginTriageExit = useCallback(
    (snippetId: string, action: InboxTriageAction) => {
      if (exitingActionsRef.current.has(snippetId)) return;
      exitingActionsRef.current.set(snippetId, action);
      inlineTriage?.onExitStart?.(snippetId);
      setExitingIds((current) => new Set(current).add(snippetId));
    },
    [inlineTriage],
  );

  const finishTriageExit = useCallback(
    (snippetId: string) => {
      const action = exitingActionsRef.current.get(snippetId);
      if (!action) return;

      exitingActionsRef.current.delete(snippetId);
      setHiddenAfterExitIds((current) => new Set(current).add(snippetId));
      setExitingIds((current) => {
        const next = new Set(current);
        next.delete(snippetId);
        return next;
      });

      if (!inlineTriage) return;
      if (action === 'processed') {
        inlineTriage.onProcessComplete(snippetId);
      } else {
        inlineTriage.onDelete(snippetId);
      }
    },
    [inlineTriage],
  );

  useEffect(() => {
    const trigger = inlineTriage?.processTrigger;
    if (!trigger) return;
    beginTriageExit(trigger.snippetId, 'processed');
    inlineTriage?.onProcessTriggerConsumed?.();
  }, [
    beginTriageExit,
    inlineTriage?.onProcessTriggerConsumed,
    inlineTriage?.processTrigger,
  ]);

  useEffect(() => {
    const visibleIds = new Set(snippets.map((snippet) => snippet.id));
    setHiddenAfterExitIds((current) => pruneHiddenAfterExitIds(current, visibleIds));
    setExitingIds((current) => {
      let changed = false;
      const next = new Set<string>();
      for (const id of current) {
        if (visibleIds.has(id)) {
          next.add(id);
        } else {
          changed = true;
        }
      }
      return changed ? next : current;
    });
  }, [snippets]);

  if (visibleSnippets.length === 0) {
    return (
      <p className="px-1 py-2 text-sm text-text-muted">{emptyMessage}</p>
    );
  }

  return (
    <ul
      className="flex flex-col"
      role="listbox"
      aria-label="Captured selections"
    >
      {visibleSnippets.map((snippet) => {
        const isActive = snippet.id === selectedSnippetId;
        const seekSeconds = snippetSeekSeconds(snippet);
        const triageStatus = effectiveTriageStatus(snippet);
        const scheduleMeta = reviewScheduleListMeta(
          snippet,
          new Date().toISOString(),
        );
        const showInlineActions =
          inlineTriage && triageStatus === 'pending';
        const isExiting = exitingIds.has(snippet.id);

        return (
          <SelectionListRow
            key={snippet.id}
            exiting={isExiting}
            onExitComplete={() => finishTriageExit(snippet.id)}
          >
            <div
              className={[
                'flex items-center gap-1 rounded-md border-l-[3px] border-transparent transition-[background-color,color] duration-200',
                isActive ? 'semia-margin-active' : '',
              ].join(' ')}
            >
              <button
                type="button"
                role="option"
                aria-selected={isActive}
                title={scheduleMeta?.absoluteLabel}
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
                {scheduleMeta ? (
                  <ReviewScheduleBadge meta={scheduleMeta} />
                ) : null}
                {cardCountForSnippet ? (
                  <CardCountBadge
                    count={cardCountForSnippet(snippet.id)}
                  />
                ) : null}
                {showStatusIcon ? (
                  <TriageStatusIcon status={triageStatus} size={16} />
                ) : null}
              </button>

              {showInlineActions ? (
                <div className="flex shrink-0 items-center gap-1 pr-2">
                  <IconTriageButton
                    label="Mark capture as processed"
                    onClick={() => inlineTriage.onRequestProcess(snippet.id)}
                  >
                    <TriageStatusIcon status="mastered" size={14} />
                  </IconTriageButton>
                  <IconTriageButton
                    label="Delete capture"
                    onClick={() => beginTriageExit(snippet.id, 'delete')}
                  >
                    <DeleteSnippetIcon size={14} />
                  </IconTriageButton>
                </div>
              ) : null}
            </div>
          </SelectionListRow>
        );
      })}
    </ul>
  );
}

const SELECTION_ROW_EXIT_MS = 300;

function SelectionListRow({
  exiting,
  onExitComplete,
  children,
}: {
  exiting: boolean;
  onExitComplete: () => void;
  children: ReactNode;
}) {
  const completedRef = useRef(false);

  useEffect(() => {
    if (!exiting) {
      completedRef.current = false;
      return;
    }

    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 0
      : SELECTION_ROW_EXIT_MS;

    const timer = window.setTimeout(() => {
      if (completedRef.current) return;
      completedRef.current = true;
      onExitComplete();
    }, duration);

    return () => window.clearTimeout(timer);
  }, [exiting, onExitComplete]);

  return (
    <li
      role="presentation"
      className={[
        'semia-selection-row-exit grid',
        exiting
          ? 'pointer-events-none mb-0 grid-rows-[0fr] opacity-0'
          : 'mb-1 grid-rows-[1fr] opacity-100 last:mb-0',
      ].join(' ')}
      onTransitionEnd={(event) => {
        if (!exiting || event.propertyName !== 'grid-template-rows') return;
        if (completedRef.current) return;
        completedRef.current = true;
        onExitComplete();
      }}
    >
      <div className="min-h-0 overflow-hidden">
        <div
          className={[
            'transition-transform duration-300 ease-out motion-reduce:transition-none',
            exiting ? '-translate-x-1.5' : 'translate-x-0',
          ].join(' ')}
        >
          {children}
        </div>
      </div>
    </li>
  );
}

function ReviewScheduleBadge({
  meta,
}: {
  meta: NonNullable<ReturnType<typeof reviewScheduleListMeta>>;
}) {
  return (
    <span
      className={reviewScheduleBadgeClass(meta.emphasis === 'urgent' ? 'urgent' : 'normal')}
    >
      {meta.relativeLabel}
    </span>
  );
}

function DeleteSnippetIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-text-muted"
      aria-hidden
    >
      <path d="M9 3h6l1 3H8l1-3Z" />
      <path d="M5 6h14v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6Z" />
      <path d="M10 10v7" />
      <path d="M14 10v7" />
    </svg>
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
