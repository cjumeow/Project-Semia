import type { VideoGroup } from '../types/corpus';
import { SelectionList } from './SelectionList';
import { VideoPreview } from './VideoPreview';

type VideoWorkspaceProps = {
  group: VideoGroup | undefined;
  selectedSnippetId: string | null;
  seekSeconds: number | undefined;
  onSelectSnippet: (snippetId: string) => void;
};

export function VideoWorkspace({
  group,
  selectedSnippetId,
  seekSeconds,
  onSelectSnippet,
}: VideoWorkspaceProps) {
  if (!group) {
    return (
      <section className="flex flex-1 items-center justify-center bg-canvas">
        <p className="text-sm text-text-muted">
          Select a video from the sidebar.
        </p>
      </section>
    );
  }

  return (
    <section className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-canvas">
      <header className="shrink-0 border-b border-border bg-surface px-5 py-4">
        <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-text">
          {group.meta.title}
        </h2>
        <p className="mt-1 text-xs text-text-muted">{group.meta.channel}</p>
      </header>

      <div className="shrink-0 px-4 pb-4 pt-5">
        <VideoPreview
          videoId={group.meta.videoId}
          title={group.meta.title}
          seekSeconds={seekSeconds}
        />
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
