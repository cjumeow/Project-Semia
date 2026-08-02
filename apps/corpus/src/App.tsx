import { useCallback, useEffect, useState } from 'react';
import { InboxWorkspace } from './components/InboxWorkspace';
import { ReviewQueueWorkspace } from './components/ReviewQueueWorkspace';
import { SemiaSettingsDialog } from './components/SemiaSettingsDialog';
import { useCorpusData } from './hooks/useCorpusData';
import { useCorpusSelection } from './hooks/useCorpusSelection';
import { useContextWindowGeneration } from './hooks/useContextWindowGeneration';
import { useSemiaSettings } from './hooks/useSemiaSettings';
import { useSnippetNoteGeneration } from './hooks/useSnippetNoteGeneration';
import { useResizableWidth } from './hooks/useResizableWidth';
import { ResizeHandle } from './components/ResizeHandle';
import { SemiaSidebar } from './components/SemiaSidebar';
import { SnippetDetail } from './components/SnippetDetail';
import { SourceWorkspace } from './components/SourceWorkspace';
import { corpusRepository } from './data/corpusRepository';
import { effectiveTriageStatus, snippetSeekSeconds } from './utils/corpusGrouping';
import { isEditableTarget } from './utils/isEditableTarget';

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { contextWindowEnabled, setContextWindowEnabled } = useSemiaSettings();
  const { groups, snippets, loading, error, fragmentCount, isLive, refresh } =
    useCorpusData();
  const {
    selection,
    inboxSourceGroups,
    librarySourceGroups,
    pendingQueue,
    dueQueue,
    selectedGroup,
    selectedSnippet,
    selectInboxSource,
    selectLibrarySource,
    selectReviewQueue,
    selectReviewQueueSnippet,
    selectSnippet,
  } = useCorpusSelection(groups, snippets);

  const { generating, error: noteError, regenerate } = useSnippetNoteGeneration(
    selectedSnippet,
    refresh,
  );

  const {
    generating: generatingContext,
    error: contextError,
  } = useContextWindowGeneration(
    selectedSnippet,
    refresh,
    contextWindowEnabled,
  );

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

  const handleMarkTriage = useCallback(
    async (snippetId: string, status: 'review' | 'mastered'): Promise<void> => {
      if (!isLive) return;
      await corpusRepository.setSnippetTriageStatus(snippetId, status);
      await refresh();
    },
    [isLive, refresh],
  );

  const handleStillLearning = useCallback(
    async (snippetId: string): Promise<void> => {
      if (!isLive) return;
      await corpusRepository.recordStillLearning(snippetId);
      await refresh();
    },
    [isLive, refresh],
  );

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

  const workspace =
    selection.pane === 'inbox' ? (
      <InboxWorkspace
        pendingSnippets={pendingQueue}
        inboxSourceCount={inboxSourceGroups.length}
        selectedSnippetId={selection.snippetId}
        onSelectSnippet={selectSnippet}
        onMarkReview={(snippetId) => {
          void handleMarkTriage(snippetId, 'review');
        }}
        onMarkMastered={(snippetId) => {
          void handleMarkTriage(snippetId, 'mastered');
        }}
        triageEnabled={isLive}
      />
    ) : selection.pane === 'review-queue' ? (
      <ReviewQueueWorkspace
        dueSnippets={dueQueue}
        selectedSnippet={selectedSnippet}
        actionsEnabled={isLive}
        generating={generating}
        noteError={noteError}
        generatingContext={generatingContext}
        contextError={contextError}
        onSelectSnippet={selectReviewQueueSnippet}
        onStillLearning={(snippetId) => {
          void handleStillLearning(snippetId);
        }}
        onMastered={(snippetId) => {
          void handleMarkTriage(snippetId, 'mastered');
        }}
        contextWindowEnabled={contextWindowEnabled}
        onOpenSettings={() => setSettingsOpen(true)}
      />
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
    );

  const showDetailPanel = selection.pane !== 'review-queue';

  return (
    <main className="flex h-screen overflow-hidden bg-canvas text-text">
      <div
        className="flex h-full shrink-0 flex-col border-r border-border bg-shelf"
        style={{ width: sidebarWidth }}
      >
        <SemiaSidebar
          pane={selection.pane}
          inboxGroups={inboxSourceGroups}
          libraryGroups={librarySourceGroups}
          dueCount={dueQueue.length}
          selectedSourceKey={selection.sourceKey}
          onSelectInboxSource={selectInboxSource}
          onSelectLibrarySource={selectLibrarySource}
          onSelectReviewQueue={selectReviewQueue}
          onOpenSettings={() => setSettingsOpen(true)}
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
        workspace
      )}

      {showDetailPanel ? (
        <>
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
              contextWindowEnabled={contextWindowEnabled}
              onOpenSettings={() => setSettingsOpen(true)}
              onMarkMastered={
                isLive &&
                selectedSnippet &&
                effectiveTriageStatus(selectedSnippet) === 'review'
                  ? () => {
                      void handleMarkTriage(selectedSnippet.id, 'mastered');
                    }
                  : undefined
              }
            />
          </div>
        </>
      ) : null}
      <SemiaSettingsDialog
        open={settingsOpen}
        contextWindowEnabled={contextWindowEnabled}
        onClose={() => setSettingsOpen(false)}
        onContextWindowEnabledChange={(enabled) => {
          void setContextWindowEnabled(enabled);
        }}
      />
    </main>
  );
}
