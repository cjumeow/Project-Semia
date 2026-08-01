import { useState, type ReactNode } from 'react';
import { SemiaButton } from '../../components/SemiaButton';
import {
  InboxIcon,
  LibraryIcon,
  WebIcon,
  YouTubeIcon,
} from '../../components/SemiaNavIcons';
import { describePrototypeState } from './inboxTriageModel';
import { TriageStatusIcon } from './TriageStatusIcon';
import type { InboxPrototypeState } from './useInboxPrototypeState';
import type {
  PrototypeSnippet,
  PrototypeSourceMeta,
  SidebarPane,
} from './inboxTriageModel';
import {
  pendingCountForSource,
  snippetsForPane,
} from './inboxTriageModel';

export function PrototypeSidebar({
  inbox,
  library,
  snippets,
  selection,
  onSelectSource,
}: {
  inbox: PrototypeSourceMeta[];
  library: PrototypeSourceMeta[];
  snippets: PrototypeSnippet[];
  selection: InboxPrototypeState['selection'];
  onSelectSource: (pane: SidebarPane, sourceKey: string) => void;
}) {
  const [inboxExpanded, setInboxExpanded] = useState(true);
  const [libraryExpanded, setLibraryExpanded] = useState(true);

  return (
    <aside className="flex h-full flex-col bg-shelf">
      <header className="shrink-0 border-b border-border/80 px-4 pb-4 pt-5">
        <h1 className="font-display text-[1.35rem] font-semibold tracking-tight text-text">
          SEMIA
        </h1>
        <p className="mt-1 text-xs text-text-muted">Inbox prototype</p>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-2 pb-3">
        <SidebarSection
          expanded={inboxExpanded}
          onToggle={() => setInboxExpanded((value) => !value)}
          icon={<InboxIcon />}
          label="Inbox"
          count={inbox.length}
        >
          {inbox.length === 0 ? (
            <EmptyHint>Nothing waiting for triage</EmptyHint>
          ) : (
            inbox.map((source) => (
              <SourceRow
                key={`inbox:${source.sourceKey}`}
                source={source}
                badge={`${pendingCountForSource(snippets, source.sourceKey)} pending`}
                isActive={
                  selection?.pane === 'inbox' &&
                  selection.sourceKey === source.sourceKey
                }
                onClick={() => onSelectSource('inbox', source.sourceKey)}
              />
            ))
          )}
        </SidebarSection>

        <SidebarSection
          expanded={libraryExpanded}
          onToggle={() => setLibraryExpanded((value) => !value)}
          icon={<LibraryIcon />}
          label="Library"
          count={library.length}
        >
          {library.length === 0 ? (
            <EmptyHint>No archived sources yet</EmptyHint>
          ) : (
            library.map((source) => (
              <SourceRow
                key={`library:${source.sourceKey}`}
                source={source}
                badge={`${snippetsForPane(snippets, source.sourceKey, 'library').length} snip`}
                isActive={
                  selection?.pane === 'library' &&
                  selection.sourceKey === source.sourceKey
                }
                onClick={() => onSelectSource('library', source.sourceKey)}
              />
            ))
          )}
        </SidebarSection>
      </div>
    </aside>
  );
}

function SidebarSection({
  expanded,
  onToggle,
  icon,
  label,
  count,
  children,
}: {
  expanded: boolean;
  onToggle: () => void;
  icon: ReactNode;
  label: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <div className="mt-1">
      <button
        type="button"
        className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left transition-colors hover:bg-black/[0.04]"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <Chevron expanded={expanded} />
        <span className="flex h-4 w-4 shrink-0 items-center justify-center">
          {icon}
        </span>
        <span className="min-w-0 flex-1 truncate text-xs font-medium text-text-muted">
          {label}
        </span>
        <span className="shrink-0 text-[10px] tabular-nums text-text-muted">
          {count}
        </span>
      </button>
      {expanded ? <div className="mt-0.5 space-y-0.5 pl-2">{children}</div> : null}
    </div>
  );
}

function SourceRow({
  source,
  badge,
  isActive,
  onClick,
}: {
  source: PrototypeSourceMeta;
  badge: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={[
        'my-0.5 flex w-full flex-col items-stretch gap-0 rounded-md border-l-[3px] border-transparent py-2 pl-[calc(0.625rem-3px)] pr-2.5 text-left transition-colors',
        isActive
          ? 'semia-margin-active text-accent shadow-sm'
          : 'text-text-secondary hover:bg-black/[0.04] hover:text-text',
      ].join(' ')}
      onClick={onClick}
    >
      <span className="flex items-center gap-1.5">
        <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
          {source.sourceKind === 'youtube' ? (
            <YouTubeIcon size={14} />
          ) : (
            <WebIcon size={14} />
          )}
        </span>
        <span className="truncate text-xs font-medium leading-snug">
          {source.title}
        </span>
      </span>
      <span
        className={[
          'mt-0.5 truncate pl-5 text-[10px] tabular-nums',
          isActive ? 'text-accent/70' : 'text-text-muted',
        ].join(' ')}
      >
        {source.subtitle} · {badge}
      </span>
    </button>
  );
}

export function WorkspaceHeader({
  source,
  pane,
  onSimulateCapture,
}: {
  source: PrototypeSourceMeta | null;
  pane: SidebarPane | null;
  onSimulateCapture?: () => void;
}) {
  if (!source || !pane) return null;

  return (
    <header className="shrink-0 border-b border-border bg-surface/80 px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wide text-text-muted">
            {pane === 'inbox' ? 'Inbox' : 'Library'}
          </p>
          <h2 className="font-display line-clamp-2 text-base font-semibold leading-snug text-text">
            {source.title}
          </h2>
          <p className="mt-1 text-xs text-text-muted">{source.subtitle}</p>
        </div>
        {onSimulateCapture ? (
          <SemiaButton variant="accent" onClick={onSimulateCapture}>
            Simulate capture
          </SemiaButton>
        ) : null}
      </div>
    </header>
  );
}

export function SnippetMetaLabel({ snippet }: { snippet: PrototypeSnippet }) {
  if (snippet.timeLabel) {
    return (
      <span className="shrink-0 font-mono text-xs tabular-nums text-text-muted">
        {snippet.timeLabel}
      </span>
    );
  }

  return (
    <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-text-muted">
      Web
    </span>
  );
}

export function SnippetRowShell({
  isActive,
  onClick,
  children,
}: {
  isActive: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={isActive}
      className={[
        'flex w-full items-center gap-3 rounded-md border-l-[3px] border-transparent py-2.5 pl-[calc(0.75rem-3px)] pr-3 text-left transition-colors',
        isActive
          ? 'semia-margin-active text-text'
          : 'text-text-secondary hover:bg-surface/60 hover:text-text',
      ].join(' ')}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function DetailTriagePanel({
  snippet,
  onMarkReview,
  onMarkMastered,
}: {
  snippet: PrototypeSnippet | null;
  onMarkReview: () => void;
  onMarkMastered: () => void;
}) {
  if (!snippet) {
    return (
      <section className="flex h-full w-full items-center justify-center px-6">
        <p className="text-center text-sm text-text-muted">
          Select a snippet to triage or review its note.
        </p>
      </section>
    );
  }

  const isPending = snippet.triageStatus === 'pending';

  return (
    <section className="flex h-full w-full flex-col overflow-y-auto">
      <header className="sticky top-0 z-10 border-b border-border bg-surface/95 px-5 py-4 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-reading min-w-0 text-xl font-semibold leading-snug tracking-tight text-text">
            {snippet.selectedText}
          </h2>
          <TriageStatusIcon status={snippet.triageStatus} size={18} />
        </div>
      </header>

      <div className="flex flex-col gap-5 p-5">
        {isPending ? (
          <div className="rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(28,25,23,0.04)]">
            <p className="semia-section-label">Triage</p>
            <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
              Mark this capture before it appears in your library.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-[#8B7355]/40 bg-[#F5EDE4] px-3 py-2 text-sm text-[#5C4A32] transition-colors hover:bg-[#EBE0D4]"
                onClick={onMarkReview}
              >
                <TriageStatusIcon status="review" size={14} />
                Review
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 transition-colors hover:bg-emerald-100"
                onClick={onMarkMastered}
              >
                <TriageStatusIcon status="mastered" size={14} />
                Mastered
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-surface p-4 text-sm text-text-secondary">
            <p className="semia-section-label">Status</p>
            <p className="mt-2 flex items-center gap-2">
              <TriageStatusIcon status={snippet.triageStatus} size={16} />
              {snippet.triageStatus === 'review'
                ? 'Still learning — will appear in Review later.'
                : 'Marked as mastered.'}
            </p>
          </div>
        )}

        <div className="rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(28,25,23,0.04)]">
          <p className="semia-section-label">Note preview</p>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            (Prototype placeholder.)
          </p>
        </div>
      </div>
    </section>
  );
}

export function PrototypeBanner({
  stateSummary,
  variantLabel,
}: {
  stateSummary: string;
  variantLabel: string;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="pointer-events-auto max-w-3xl rounded-full border border-border bg-text px-4 py-2 text-center shadow-lg">
        <p className="font-mono text-[10px] font-medium uppercase tracking-wide text-surface">
          Prototype — {variantLabel}
        </p>
        <p className="mt-0.5 text-[11px] text-surface/80">{stateSummary}</p>
      </div>
    </div>
  );
}

export function describeState(snippets: PrototypeSnippet[]): string {
  return describePrototypeState(snippets);
}

function EmptyHint({ children }: { children: ReactNode }) {
  return (
    <p className="px-2.5 py-2 text-[11px] leading-snug text-text-muted">{children}</p>
  );
}

function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className={`shrink-0 text-text-muted transition-transform duration-150 ${expanded ? 'rotate-90' : ''}`}
      aria-hidden
    >
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
