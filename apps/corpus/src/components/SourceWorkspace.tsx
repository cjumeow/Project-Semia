import { sortLibrarySnippets } from '@semia/shared';
import { useMemo } from 'react';
import type { SourceGroup } from '../types/corpus';
import { useLibrarySortByReview } from '../hooks/useLibrarySortByReview';
import { SemiaButton } from './SemiaButton';
import { SelectionList } from './SelectionList';
import { VideoPreview } from './VideoPreview';
import { WebPreview, webPreviewPropsForSnippet } from './WebPreview';

type SourceWorkspaceProps = {
  group: SourceGroup | undefined;
  selectedSnippetId: string | null;
  seekSeconds: number | undefined;
  onSelectSnippet: (snippetId: string) => void;
  onDeleteSource?: () => void;
  cardCountForSnippet?: (snippetId: string) => number;
};

export function SourceWorkspace({
  group,
  selectedSnippetId,
  seekSeconds,
  onSelectSnippet,
  onDeleteSource,
  cardCountForSnippet,
}: SourceWorkspaceProps) {
  const [sortByReview, setSortByReview] = useLibrarySortByReview();
  const orderedSnippets = useMemo(
    () =>
      sortLibrarySnippets(
        group?.snippets ?? [],
        sortByReview,
        new Date().toISOString(),
      ),
    [group?.snippets, sortByReview],
  );

  if (!group) {
    return (
      <section className="flex flex-1 items-center justify-center bg-canvas">
        <p className="text-sm text-text-muted">
          Select a source from the sidebar.
        </p>
      </section>
    );
  }

  const selectedSnippet = group.snippets.find(
    (snippet) => snippet.id === selectedSnippetId,
  );

  return (
    <section className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-canvas">
      <header className="shrink-0 border-b border-border bg-surface/80 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display line-clamp-2 text-base font-semibold leading-snug text-text">
              {group.meta.title}
            </h2>
            <p className="mt-1 text-xs text-text-muted">
              {group.meta.kind === 'youtube'
                ? group.meta.channel
                : group.meta.hostname}
            </p>
          </div>
          {onDeleteSource ? (
            <SemiaButton
              variant="danger"
              icon={<TrashIcon />}
              className="shrink-0"
              onClick={onDeleteSource}
              aria-label={`Delete all snippets from ${group.meta.title}`}
              title="Delete source and all snippets"
            >
              Delete source
            </SemiaButton>
          ) : null}
        </div>
      </header>

      <div className="shrink-0 px-4 pb-4 pt-5">
        {group.meta.kind === 'youtube' ? (
          <VideoPreview
            videoId={group.meta.videoId}
            title={group.meta.title}
            seekSeconds={seekSeconds}
          />
        ) : (
          <WebPreview
            {...webPreviewPropsForSnippet(
              selectedSnippet ?? group.snippets[0]!,
            )}
          />
        )}
      </div>

      <div className="min-h-0 flex-1 px-5 pb-6">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 className="semia-section-label">Selections</h3>
          <label className="flex cursor-pointer items-center gap-2 text-[11px] text-text-secondary">
            <input
              type="checkbox"
              className="rounded border-border"
              checked={sortByReview}
              onChange={(event) => setSortByReview(event.target.checked)}
            />
            Sort by next review
          </label>
        </div>
        <SelectionList
          snippets={orderedSnippets}
          selectedSnippetId={selectedSnippetId}
          onSelectSnippet={onSelectSnippet}
          showMediaLabel={false}
          showStatusIcon
          cardCountForSnippet={cardCountForSnippet}
        />
      </div>
    </section>
  );
}

function TrashIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}

/** @deprecated Use SourceWorkspace */
export const VideoWorkspace = SourceWorkspace;
