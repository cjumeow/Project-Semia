import { ResizeHandle } from '../../../components/ResizeHandle';
import { useResizableWidth } from '../../../hooks/useResizableWidth';
import {
  DetailTriagePanel,
  PrototypeBanner,
  PrototypeSidebar,
  SnippetMetaLabel,
  SnippetRowShell,
  WorkspaceHeader,
  describeState,
} from '../prototypeShared';
import { TriageStatusIcon } from '../TriageStatusIcon';
import type { InboxPrototypeState } from '../useInboxPrototypeState';

/** C — Inbox pane shows a flat cross-source queue; Library stays per-source. */
export function VariantC({ state }: { state: InboxPrototypeState }) {
  const {
    snippets,
    inbox,
    library,
    selection,
    visibleSnippets,
    selectedSnippet,
    selectedSource,
    allPendingSnippets,
    selectSource,
    selectSnippet,
    markSnippet,
    handleSimulateCapture,
  } = state;

  const { width: sidebarWidth, onResizeStart: onSidebarResizeStart } =
    useResizableWidth({
      min: 160,
      max: 480,
      defaultWidth: 280,
      storageKey: 'semia-prototype-sidebar-width',
      edge: 'end',
    });

  const { width: detailWidth, onResizeStart: onDetailResizeStart } =
    useResizableWidth({
      min: 280,
      max: 640,
      defaultWidth: 380,
      storageKey: 'semia-prototype-detail-width',
      edge: 'start',
    });

  const isInboxPane = selection?.pane === 'inbox';
  const listSnippets = isInboxPane ? allPendingSnippets : visibleSnippets;

  return (
    <>
      <div
        className="flex h-full shrink-0 flex-col border-r border-border bg-shelf"
        style={{ width: sidebarWidth }}
      >
        <PrototypeSidebar
          inbox={inbox}
          library={library}
          snippets={snippets}
          selection={selection}
          onSelectSource={selectSource}
        />
      </div>

      <ResizeHandle onResizeStart={onSidebarResizeStart} />

      <section className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-canvas">
        {!selection ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-text-muted">Select a source from the sidebar.</p>
          </div>
        ) : isInboxPane ? (
          <>
            <header className="shrink-0 border-b border-border bg-surface/80 px-5 py-4">
              <p className="text-[10px] font-medium uppercase tracking-wide text-text-muted">
                Inbox queue
              </p>
              <h2 className="font-display text-base font-semibold text-text">
                All pending captures
              </h2>
              <p className="mt-1 text-xs text-text-muted">
                {allPendingSnippets.length} snippet
                {allPendingSnippets.length === 1 ? '' : 's'} across {inbox.length}{' '}
                source{inbox.length === 1 ? '' : 's'}
              </p>
            </header>
            <div className="min-h-0 flex-1 px-5 pb-24 pt-5">
              <ul className="flex flex-col gap-1" role="listbox">
                {listSnippets.map((snippet) => (
                  <li key={snippet.id} role="presentation">
                    <SnippetRowShell
                      isActive={snippet.id === selectedSnippet?.id}
                      onClick={() =>
                        selectSnippet(snippet.id, snippet.sourceKey, 'inbox')
                      }
                    >
                      <SnippetMetaLabel snippet={snippet} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {snippet.selectedText}
                        </span>
                        <span className="block truncate text-[11px] text-text-muted">
                          {snippet.sourceTitle}
                        </span>
                      </span>
                      <TriageStatusIcon status={snippet.triageStatus} size={16} />
                    </SnippetRowShell>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <>
            <WorkspaceHeader
              source={selectedSource}
              pane={selection.pane}
              onSimulateCapture={
                selection.sourceKey === 'youtube:immersion-tips'
                  ? handleSimulateCapture
                  : undefined
              }
            />
            <div className="min-h-0 flex-1 px-5 pb-24 pt-5">
              <h3 className="semia-section-label mb-2">Selections</h3>
              <ul className="flex flex-col gap-1" role="listbox">
                {listSnippets.map((snippet) => (
                  <li key={snippet.id} role="presentation">
                    <SnippetRowShell
                      isActive={snippet.id === selectedSnippet?.id}
                      onClick={() => selectSnippet(snippet.id)}
                    >
                      <SnippetMetaLabel snippet={snippet} />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">
                        {snippet.selectedText}
                      </span>
                      <TriageStatusIcon status={snippet.triageStatus} size={16} />
                    </SnippetRowShell>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </section>

      <ResizeHandle onResizeStart={onDetailResizeStart} />

      <div
        className="flex h-full shrink-0 border-l border-border bg-surface"
        style={{ width: detailWidth }}
      >
        <DetailTriagePanel
          snippet={selectedSnippet}
          onMarkReview={() => selectedSnippet && markSnippet(selectedSnippet.id, 'review')}
          onMarkMastered={() =>
            selectedSnippet && markSnippet(selectedSnippet.id, 'mastered')
          }
        />
      </div>

      <PrototypeBanner
        stateSummary={describeState(snippets)}
        variantLabel="C — Flat inbox queue"
      />
    </>
  );
}
