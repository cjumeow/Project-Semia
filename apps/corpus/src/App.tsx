import { useCallback, useEffect } from 'react';
import { useCorpusData } from './hooks/useCorpusData';
import { useCorpusSelection } from './hooks/useCorpusSelection';
import { useContextWindowGeneration } from './hooks/useContextWindowGeneration';
import { useSnippetNoteGeneration } from './hooks/useSnippetNoteGeneration';
import { useResizableWidth } from './hooks/useResizableWidth';
import { ResizeHandle } from './components/ResizeHandle';
import { SemiaSidebar } from './components/SemiaSidebar';
import { SnippetDetail } from './components/SnippetDetail';
import { SourceWorkspace } from './components/SourceWorkspace';
import { corpusRepository } from './data/corpusRepository';
import { snippetSeekSeconds } from './utils/corpusGrouping';
import { isEditableTarget } from './utils/isEditableTarget';

export default function App() {
  const { groups, loading, error, fragmentCount, isLive, refresh } =
    useCorpusData();
  const {
    selection,
    selectedGroup,
    selectedSnippet,
    selectSource,
    selectSnippet,
  } = useCorpusSelection(groups);

  const { generating, error: noteError, regenerate } = useSnippetNoteGeneration(
    selectedSnippet,
    refresh,
  );

  const {
    generating: generatingContext,
    error: contextError,
    generate: generateContext,
  } = useContextWindowGeneration(selectedSnippet, refresh);

  const { width: sidebarWidth, onResizeStart: onSidebarResizeStart } =
    useResizableWidth({
      min: 160,
      max: 480,
      defaultWidth: 280,
      storageKey: 'semia-sidebar-width',
      edge: 'end',
    });

  const { width: detailWidth, onResizeStart: onDetailResizeStart } =
    useResizableWidth({
      min: 280,
      max: 640,
      defaultWidth: 600,
      storageKey: 'semia-detail-width',
      edge: 'start',
    });

  const showEmpty = !loading && !error && groups.length === 0;

  const handleDeleteSnippet = useCallback(async (): Promise<void> => {
    if (!selectedSnippet || !isLive) return;
    await corpusRepository.deleteFragment(selectedSnippet.id);
    await refresh();
  }, [isLive, refresh, selectedSnippet]);

  const handleDeleteSource = useCallback(async (): Promise<void> => {
    if (!selectedGroup || !isLive) return;

    const label =
      selectedGroup.meta.kind === 'youtube' ? 'YouTube video' : 'web page';
    const confirmed = window.confirm(
      `Delete this ${label} and all ${selectedGroup.snippets.length} snippet${
        selectedGroup.snippets.length === 1 ? '' : 's'
      }? This cannot be undone.`,
    );
    if (!confirmed) return;

    await corpusRepository.deleteSource(selectedGroup.meta.sourceUrl);
    await refresh();
  }, [isLive, refresh, selectedGroup]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Backspace') return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isEditableTarget(event.target)) return;
      if (!selectedSnippet || !isLive || loading || error) return;

      event.preventDefault();
      void handleDeleteSnippet();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [error, handleDeleteSnippet, isLive, loading, selectedSnippet]);

  return (
    <main className="flex h-screen overflow-hidden bg-canvas text-text">
      <div
        className="flex h-full shrink-0 flex-col border-r border-border bg-shelf"
        style={{ width: sidebarWidth }}
      >
        <SemiaSidebar
          groups={groups}
          selectedSourceKey={selection.sourceKey}
          onSelectSource={selectSource}
        />
      </div>

      <ResizeHandle onResizeStart={onSidebarResizeStart} />

      {loading ? (
        <section className="flex flex-1 items-center justify-center bg-canvas">
          <p className="text-sm text-text-muted">Loading captures…</p>
        </section>
      ) : error ? (
        <section className="flex flex-1 items-center justify-center bg-canvas">
          <p className="px-6 text-center text-sm text-red-600">{error}</p>
        </section>
      ) : showEmpty ? (
        <section className="flex flex-1 items-center justify-center bg-canvas">
          <div className="max-w-sm px-6 text-center">
            {!isLive ? (
              <>
                <p className="text-sm font-medium text-text">Preview mode</p>
                <p className="mt-2 text-sm text-text-muted">
                  This dev preview cannot read Chrome extension storage. Open
                  SEMIA from the extension icon or LingoPanel on YouTube.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-text">No captures yet</p>
                <p className="mt-2 text-sm text-text-muted">
                  Capture snippets from YouTube or any web page, then return here
                  to review them.
                </p>
                <p className="mt-3 text-xs text-text-muted">
                  Storage check: {fragmentCount} capture
                  {fragmentCount === 1 ? '' : 's'} found.
                </p>
              </>
            )}
          </div>
        </section>
      ) : (
        <SourceWorkspace
          group={selectedGroup}
          selectedSnippetId={selection.snippetId}
          seekSeconds={
            selectedSnippet ? snippetSeekSeconds(selectedSnippet) : undefined
          }
          onSelectSnippet={selectSnippet}
          onDeleteSource={isLive ? () => void handleDeleteSource() : undefined}
        />
      )}

      <ResizeHandle onResizeStart={onDetailResizeStart} />

      <div className="flex h-full shrink-0 border-l border-border bg-surface shadow-[inset_1px_0_0_rgba(28,25,23,0.04)]">
        <SnippetDetail
          snippet={selectedSnippet}
          width={detailWidth}
          generating={generating}
          error={noteError}
          onRegenerate={() => {
            void regenerate();
          }}
          generatingContext={generatingContext}
          contextError={contextError}
          onGenerateContext={() => {
            void generateContext();
          }}
        />
      </div>
    </main>
  );
}
