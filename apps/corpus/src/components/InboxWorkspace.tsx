import type { CorpusSnippet } from '../types/corpus';
import { SelectionList } from './SelectionList';

type InboxWorkspaceProps = {
  pendingSnippets: CorpusSnippet[];
  inboxSourceCount: number;
  selectedSnippetId: string | null;
  onSelectSnippet: (snippetId: string) => void;
  onMarkReview: (snippetId: string) => void;
  onMarkMastered: (snippetId: string) => void;
  triageEnabled: boolean;
};

export function InboxWorkspace({
  pendingSnippets,
  inboxSourceCount,
  selectedSnippetId,
  onSelectSnippet,
  onMarkReview,
  onMarkMastered,
  triageEnabled,
}: InboxWorkspaceProps) {
  return (
    <section className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-canvas">
      <header className="shrink-0 border-b border-border bg-surface/80 px-5 py-4">
        <p className="text-[10px] font-medium uppercase tracking-wide text-text-muted">
          Inbox queue
        </p>
        <h2 className="font-display text-base font-semibold text-text">
          All pending captures
        </h2>
        <p className="mt-1 text-xs text-text-muted">
          {pendingSnippets.length} snippet
          {pendingSnippets.length === 1 ? '' : 's'} across {inboxSourceCount}{' '}
          source{inboxSourceCount === 1 ? '' : 's'}
        </p>
      </header>

      <div className="min-h-0 flex-1 px-5 pb-6 pt-5">
        <SelectionList
          snippets={pendingSnippets}
          selectedSnippetId={selectedSnippetId}
          onSelectSnippet={onSelectSnippet}
          showSourceSubtitle
          inlineTriage={
            triageEnabled
              ? {
                  onMarkReview,
                  onMarkMastered,
                }
              : undefined
          }
          emptyMessage="Nothing waiting for triage."
        />
      </div>
    </section>
  );
}
