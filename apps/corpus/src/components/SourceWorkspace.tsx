import type { SourceGroup } from '../types/corpus';
import { SelectionList } from './SelectionList';
import { VideoPreview } from './VideoPreview';
import { WebPreview, webPreviewPropsForSnippet } from './WebPreview';

type SourceWorkspaceProps = {
  group: SourceGroup | undefined;
  selectedSnippetId: string | null;
  seekSeconds: number | undefined;
  onSelectSnippet: (snippetId: string) => void;
  onDeleteSource?: () => void;
};

export function SourceWorkspace({
  group,
  selectedSnippetId,
  seekSeconds,
  onSelectSnippet,
  onDeleteSource,
}: SourceWorkspaceProps) {
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
      <header className="shrink-0 border-b border-border bg-surface px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-text">
              {group.meta.title}
            </h2>
            <p className="mt-1 text-xs text-text-muted">
              {group.meta.kind === 'youtube'
                ? group.meta.channel
                : group.meta.hostname}
            </p>
          </div>
          {onDeleteSource ? (
            <button
              type="button"
              className="shrink-0 rounded-md border border-border px-2.5 py-1.5 text-xs text-text-muted transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700"
              onClick={onDeleteSource}
              aria-label={`Delete all snippets from ${group.meta.title}`}
              title="Delete source and all snippets"
            >
              Delete source
            </button>
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
        <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
          Selections
        </h3>
        <SelectionList
          snippets={group.snippets}
          selectedSnippetId={selectedSnippetId}
          onSelectSnippet={onSelectSnippet}
        />
      </div>
    </section>
  );
}

/** @deprecated Use SourceWorkspace */
export const VideoWorkspace = SourceWorkspace;
