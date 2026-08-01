import type { ReactNode } from 'react';
import { ResizeHandle } from '../../../components/ResizeHandle';
import { useResizableWidth } from '../../../hooks/useResizableWidth';
import {
  PrototypeBanner,
  PrototypeSidebar,
  SnippetMetaLabel,
  WorkspaceHeader,
  describeState,
} from '../prototypeShared';
import { TriageStatusIcon } from '../TriageStatusIcon';
import type { InboxPrototypeState } from '../useInboxPrototypeState';

/** B — Inline icon actions on each pending row; detail panel is read-only preview. */
export function VariantB({ state }: { state: InboxPrototypeState }) {
  const {
    snippets,
    inbox,
    library,
    selection,
    visibleSnippets,
    selectedSnippet,
    selectedSource,
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
        {!selectedSource || !selection ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-text-muted">Select a source from the sidebar.</p>
          </div>
        ) : (
          <>
            <WorkspaceHeader
              source={selectedSource}
              pane={selection.pane}
              onSimulateCapture={
                selection.pane === 'library' &&
                selection.sourceKey === 'youtube:immersion-tips'
                  ? handleSimulateCapture
                  : undefined
              }
            />
            <div className="min-h-0 flex-1 px-5 pb-24 pt-5">
              <h3 className="semia-section-label mb-2">Selections</h3>
              <ul className="flex flex-col gap-1" role="listbox">
                {visibleSnippets.map((snippet) => {
                  const isActive = snippet.id === selectedSnippet?.id;
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
                          className="flex min-w-0 flex-1 items-center gap-3 py-2.5 pl-[calc(0.75rem-3px)] pr-2 text-left transition-colors hover:bg-surface/60"
                          onClick={() => selectSnippet(snippet.id)}
                        >
                          <SnippetMetaLabel snippet={snippet} />
                          <span className="min-w-0 flex-1 truncate text-sm font-medium text-text-secondary">
                            {snippet.selectedText}
                          </span>
                          <TriageStatusIcon status={snippet.triageStatus} size={16} />
                        </button>

                        {snippet.triageStatus === 'pending' ? (
                          <div className="flex shrink-0 items-center gap-1 pr-2">
                            <IconTriageButton
                              label="Mark as review"
                              onClick={() => markSnippet(snippet.id, 'review')}
                            >
                              <TriageStatusIcon status="review" size={14} />
                            </IconTriageButton>
                            <IconTriageButton
                              label="Mark as mastered"
                              onClick={() => markSnippet(snippet.id, 'mastered')}
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
            </div>
          </>
        )}
      </section>

      <ResizeHandle onResizeStart={onDetailResizeStart} />

      <div
        className="flex h-full shrink-0 border-l border-border bg-surface"
        style={{ width: detailWidth }}
      >
        <ReadOnlyDetail snippet={selectedSnippet} />
      </div>

      <PrototypeBanner
        stateSummary={describeState(snippets)}
        variantLabel="B — Inline actions"
      />
    </>
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
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function ReadOnlyDetail({
  snippet,
}: {
  snippet: InboxPrototypeState['selectedSnippet'];
}) {
  if (!snippet) {
    return (
      <section className="flex h-full w-full items-center justify-center px-6">
        <p className="text-center text-sm text-text-muted">Select a snippet to preview.</p>
      </section>
    );
  }

  return (
    <section className="flex h-full w-full flex-col overflow-y-auto">
      <header className="border-b border-border px-5 py-4">
        <div className="flex items-start gap-3">
          <h2 className="font-reading min-w-0 flex-1 text-xl font-semibold leading-snug text-text">
            {snippet.selectedText}
          </h2>
          <TriageStatusIcon status={snippet.triageStatus} size={18} />
        </div>
      </header>
      <div className="p-5">
        <div className="rounded-xl border border-border bg-surface p-4 text-sm text-text-secondary">
          <p className="semia-section-label">Note preview</p>
          <p className="mt-2 text-text-muted">(Prototype placeholder.)</p>
        </div>
      </div>
    </section>
  );
}
