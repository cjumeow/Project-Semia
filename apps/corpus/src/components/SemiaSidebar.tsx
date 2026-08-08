import { useState, type ReactNode } from 'react';
import { SEMIA_BUILD_ID } from '../buildInfo';
import type { CorpusPane, SourceGroup } from '../types/corpus';
import {
  pendingCountForSourceGroup,
  sourceSubtitleForGroup,
  webGroups,
  youtubeGroups,
} from '../utils/corpusGrouping';
import {
  InboxIcon,
  LibraryIcon,
  ListCollapseIcon,
  PracticeIcon,
  SettingsIcon,
  StudyCardsIcon,
  WebIcon,
  YouTubeIcon,
} from './SemiaNavIcons';

type SemiaSidebarProps = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  pane: CorpusPane;
  inboxGroups: SourceGroup[];
  libraryGroups: SourceGroup[];
  myCardsCount: number;
  dueCount: number;
  dueCardCount: number;
  selectedSourceKey: string | null;
  onSelectInboxSource: (sourceKey: string) => void;
  onSelectLibrarySource: (sourceKey: string) => void;
  onSelectMyCards: () => void;
  onSelectReviewQueue: () => void;
  onSelectCardReviewQueue: () => void;
  onOpenSettings: () => void;
};

export function SemiaSidebar({
  collapsed,
  onToggleCollapsed,
  pane,
  inboxGroups,
  libraryGroups,
  myCardsCount,
  dueCount,
  dueCardCount,
  selectedSourceKey,
  onSelectInboxSource,
  onSelectLibrarySource,
  onSelectMyCards,
  onSelectReviewQueue,
  onSelectCardReviewQueue,
  onOpenSettings,
}: SemiaSidebarProps) {
  const [inboxExpanded, setInboxExpanded] = useState(false);
  const [libraryExpanded, setLibraryExpanded] = useState(false);
  const [reviewQueueExpanded, setReviewQueueExpanded] = useState(false);
  const [youtubeExpanded, setYoutubeExpanded] = useState(false);
  const [webExpanded, setWebExpanded] = useState(false);

  const youtube = youtubeGroups(libraryGroups);
  const web = webGroups(libraryGroups);

  const expandIfCollapsed = (action: () => void) => {
    if (collapsed) {
      onToggleCollapsed();
    }
    action();
  };

  return (
    <aside className="flex h-full min-w-0 flex-col overflow-x-hidden bg-shelf">
      <header
        className={[
          'flex shrink-0 items-center border-b border-border/60',
          collapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-2 py-2',
        ].join(' ')}
      >
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-canvas hover:text-text"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
        >
          <ListCollapseIcon
            size={18}
            className={[
              'text-text-secondary transition-transform duration-200',
              collapsed ? 'rotate-180' : '',
            ].join(' ')}
          />
        </button>
      </header>

      {collapsed ? (
        <CollapsedSidebarRail
          pane={pane}
          dueCount={dueCount}
          dueCardCount={dueCardCount}
          myCardsCount={myCardsCount}
          onSelectInbox={() => expandIfCollapsed(() => setInboxExpanded(true))}
          onSelectLibrary={() => expandIfCollapsed(() => setLibraryExpanded(true))}
          onSelectPractice={() => expandIfCollapsed(() => setReviewQueueExpanded(true))}
          onSelectMyCards={() => expandIfCollapsed(onSelectMyCards)}
          onOpenSettings={() => expandIfCollapsed(onOpenSettings)}
        />
      ) : (
        <>
      <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto px-2 pb-3 pt-3">
        <SidebarRow
          variant="section"
          expanded={inboxExpanded}
          onToggle={() => setInboxExpanded((value) => !value)}
          icon={<InboxIcon />}
          label="Inbox"
          count={inboxGroups.length}
          ariaLabel="Inbox"
        />

        {inboxExpanded ? (
          <div className="mt-0.5 space-y-0.5 pl-2">
            {inboxGroups.length === 0 ? (
              <EmptyHint>Nothing waiting for triage</EmptyHint>
            ) : (
              inboxGroups.map((group) => (
                <SourceButton
                  key={`inbox:${group.meta.sourceKey}`}
                  title={group.meta.title}
                  subtitle={`${sourceSubtitleForGroup(group)} · ${pendingCountForSourceGroup(group)} pending`}
                  icon={
                    group.meta.kind === 'youtube' ? (
                      <YouTubeIcon size={15} />
                    ) : (
                      <WebIcon size={15} />
                    )
                  }
                  isActive={
                    pane === 'inbox' &&
                    group.meta.sourceKey === selectedSourceKey
                  }
                  onClick={() => onSelectInboxSource(group.meta.sourceKey)}
                />
              ))
            )}
          </div>
        ) : null}

        <SidebarRow
          variant="section"
          expanded={libraryExpanded}
          onToggle={() => setLibraryExpanded((value) => !value)}
          icon={<LibraryIcon />}
          label="Library"
          count={libraryGroups.length}
          ariaLabel="Library"
          className="mt-2"
        />

        {libraryExpanded ? (
          <div className="mt-0.5 space-y-0.5 pl-2">
            <p className="px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-text-muted">
              Media
            </p>

            <SidebarFolder
              title="YouTube"
              count={youtube.length}
              expanded={youtubeExpanded}
              onToggle={() => setYoutubeExpanded((value) => !value)}
              icon={<YouTubeIcon />}
              ariaLabel="YouTube videos"
            >
              {youtube.length === 0 ? (
                <EmptyHint>No archived YouTube sources yet</EmptyHint>
              ) : (
                youtube.map((group) => (
                  <SourceButton
                    key={group.meta.sourceKey}
                    title={group.meta.title}
                    subtitle={
                      group.meta.kind === 'youtube'
                        ? `${group.meta.channel} · ${group.snippets.length} snip`
                        : `${group.snippets.length} snip`
                    }
                    isActive={
                      pane === 'library' &&
                      group.meta.sourceKey === selectedSourceKey
                    }
                    onClick={() => onSelectLibrarySource(group.meta.sourceKey)}
                  />
                ))
              )}
            </SidebarFolder>

            <SidebarFolder
              title="Web"
              count={web.length}
              expanded={webExpanded}
              onToggle={() => setWebExpanded((value) => !value)}
              icon={<WebIcon />}
              ariaLabel="Web pages"
            >
              {web.length === 0 ? (
                <EmptyHint>No archived web sources yet</EmptyHint>
              ) : (
                web.map((group) => (
                  <SourceButton
                    key={group.meta.sourceKey}
                    title={group.meta.title}
                    subtitle={
                      group.meta.kind === 'web'
                        ? `${group.meta.hostname} · ${group.snippets.length} snip`
                        : `${group.snippets.length} snip`
                    }
                    isActive={
                      pane === 'library' &&
                      group.meta.sourceKey === selectedSourceKey
                    }
                    onClick={() => onSelectLibrarySource(group.meta.sourceKey)}
                  />
                ))
              )}
            </SidebarFolder>
          </div>
        ) : null}

        <SidebarRow
          variant="section"
          expanded={reviewQueueExpanded}
          onToggle={() => setReviewQueueExpanded((value) => !value)}
          icon={<PracticeIcon />}
          label="Practice"
          count={dueCount + dueCardCount}
          ariaLabel="Practice"
          className="mt-2"
        />

        {reviewQueueExpanded ? (
          <div className="mt-0.5 space-y-0.5 pl-2">
            <button
              type="button"
              className={[
                rowBase,
                rowHover,
                'my-0.5 flex-col items-stretch gap-0 border-l-[3px] border-transparent py-2 pl-[calc(0.625rem-3px)]',
                pane === 'review-queue'
                  ? 'semia-margin-active text-text'
                  : 'text-text-secondary hover:text-text',
              ].join(' ')}
              onClick={onSelectReviewQueue}
            >
              <span className="truncate text-xs font-medium leading-snug">
                Snippets due
              </span>
              <span
                className={[
                  'mt-0.5 truncate text-[11px] tabular-nums',
                  pane === 'review-queue' ? 'text-text-muted' : 'text-text-muted',
                ].join(' ')}
              >
                {dueCount} snippet{dueCount === 1 ? '' : 's'}
              </span>
            </button>
            <button
              type="button"
              className={[
                rowBase,
                rowHover,
                'my-0.5 flex-col items-stretch gap-0 border-l-[3px] border-transparent py-2 pl-[calc(0.625rem-3px)]',
                pane === 'card-review-queue'
                  ? 'semia-margin-active text-text'
                  : 'text-text-secondary hover:text-text',
              ].join(' ')}
              onClick={onSelectCardReviewQueue}
            >
              <span className="truncate text-xs font-medium leading-snug">
                Cards due
              </span>
              <span
                className={[
                  'mt-0.5 truncate text-[11px] tabular-nums',
                  pane === 'card-review-queue'
                    ? 'text-text-muted'
                    : 'text-text-muted',
                ].join(' ')}
              >
                {dueCardCount} card{dueCardCount === 1 ? '' : 's'}
              </span>
            </button>
          </div>
        ) : null}

        <MyCardsPinnedButton
          count={myCardsCount}
          isActive={pane === 'my-cards'}
          onClick={onSelectMyCards}
        />
      </div>

      <footer className="shrink-0 border-t border-border/60 px-4 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            className={[
            'rounded-md px-2 py-1 text-[11px] font-medium transition-colors',
            pane === 'settings'
              ? 'semia-selection-icon-active'
              : 'text-text-secondary hover:bg-canvas hover:text-text',
          ].join(' ')}
            onClick={onOpenSettings}
          >
            Settings
          </button>
          <p className="font-mono text-[10px] text-text-muted">{SEMIA_BUILD_ID}</p>
        </div>
      </footer>
        </>
      )}
    </aside>
  );
}

const rowBase =
  'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left transition-[background-color,color,box-shadow,border-color] duration-150';

const rowHover = 'hover:bg-black/[0.05]';

function CollapsedSidebarRail({
  pane,
  dueCount,
  dueCardCount,
  myCardsCount,
  onSelectInbox,
  onSelectLibrary,
  onSelectPractice,
  onSelectMyCards,
  onOpenSettings,
}: {
  pane: CorpusPane;
  dueCount: number;
  dueCardCount: number;
  myCardsCount: number;
  onSelectInbox: () => void;
  onSelectLibrary: () => void;
  onSelectPractice: () => void;
  onSelectMyCards: () => void;
  onOpenSettings: () => void;
}) {
  const practiceCount = dueCount + dueCardCount;

  return (
    <>
      <nav
        className="flex min-h-0 flex-1 flex-col items-center gap-1 overflow-x-hidden overflow-y-auto px-2 py-3"
        aria-label="Sidebar"
      >
        <CollapsedNavButton
          label="Inbox"
          isActive={pane === 'inbox'}
          onClick={onSelectInbox}
          icon={<InboxIcon size={16} />}
        />
        <CollapsedNavButton
          label="Library"
          isActive={pane === 'library'}
          onClick={onSelectLibrary}
          icon={<LibraryIcon size={16} />}
        />
        <CollapsedNavButton
          label="Practice"
          isActive={pane === 'review-queue' || pane === 'card-review-queue'}
          onClick={onSelectPractice}
          icon={<PracticeIcon size={16} />}
          badge={practiceCount > 0 ? practiceCount : undefined}
        />
        <CollapsedNavButton
          label="Learning cards"
          isActive={pane === 'my-cards'}
          onClick={onSelectMyCards}
          icon={<StudyCardsIcon size={16} />}
          badge={myCardsCount > 0 ? myCardsCount : undefined}
        />
      </nav>

      <footer className="flex shrink-0 justify-center border-t border-border/60 py-2.5">
        <CollapsedNavButton
          label="Settings"
          isActive={pane === 'settings'}
          onClick={onOpenSettings}
          icon={<SettingsIcon size={16} />}
        />
      </footer>
    </>
  );
}

function CollapsedNavButton({
  label,
  icon,
  isActive,
  badge,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  isActive: boolean;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={[
        'relative flex h-9 w-9 items-center justify-center rounded-md transition-colors',
        isActive
          ? 'semia-selection-icon-active'
          : 'text-text-secondary hover:bg-canvas hover:text-text',
      ].join(' ')}
      onClick={onClick}
    >
      {icon}
      {badge !== undefined ? (
        <span className="absolute right-0 top-0 flex h-4 min-w-4 max-w-[calc(100%+2px)] items-center justify-center rounded-full bg-accent px-1 text-[9px] font-semibold tabular-nums text-white">
          {badge > 99 ? '99+' : badge}
        </span>
      ) : null}
    </button>
  );
}

function SidebarRow({
  variant,
  expanded,
  onToggle,
  icon,
  label,
  count,
  ariaLabel,
  className = '',
}: {
  variant: 'section' | 'folder';
  expanded?: boolean;
  onToggle: () => void;
  icon?: ReactNode;
  label: string;
  count?: number;
  ariaLabel?: string;
  className?: string;
}) {
  const isSection = variant === 'section';
  const isFolder = variant === 'folder';

  return (
    <button
      type="button"
      className={[rowBase, rowHover, isFolder ? 'text-text-secondary' : '', className]
        .filter(Boolean)
        .join(' ')}
      onClick={onToggle}
      aria-expanded={expanded}
      aria-label={ariaLabel ?? label}
    >
      <ChevronIcon expanded={expanded ?? false} />
      {icon ? (
        <span className="flex h-4 w-4 shrink-0 items-center justify-center">
          {icon}
        </span>
      ) : null}
      <span
        className={[
          'min-w-0 flex-1 truncate',
          isSection
            ? 'semia-sidebar-section-label text-[13px]'
            : isFolder
              ? 'text-[13px] font-medium text-text-secondary'
              : 'text-[13px] font-medium',
        ].join(' ')}
      >
        {label}
      </span>
      {count !== undefined ? (
        <span className="shrink-0 text-[11px] tabular-nums text-text-muted">
          {count}
        </span>
      ) : null}
    </button>
  );
}

function SidebarFolder({
  title,
  count,
  expanded,
  onToggle,
  icon,
  ariaLabel,
  children,
}: {
  title: string;
  count: number;
  expanded: boolean;
  onToggle: () => void;
  icon?: ReactNode;
  ariaLabel: string;
  children: ReactNode;
}) {
  return (
    <div>
      <SidebarRow
        variant="folder"
        expanded={expanded}
        onToggle={onToggle}
        icon={icon}
        label={title}
        count={count}
        ariaLabel={ariaLabel}
      />

      {expanded ? (
        <nav className="mt-0.5 space-y-0.5 pl-3" aria-label={ariaLabel}>
          {children}
        </nav>
      ) : null}
    </div>
  );
}

function MyCardsPinnedButton({
  count,
  isActive,
  onClick,
}: {
  count: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <div className="mt-2">
      <button
        type="button"
        className={[
          'flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors',
          isActive
            ? 'semia-selection-chip-active border-2 border-accent text-text'
            : 'border border-border bg-surface text-text-secondary hover:border-border-strong hover:bg-canvas',
        ].join(' ')}
        onClick={onClick}
      >
        <StudyCardsIcon />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold">
            Learning cards
          </span>
          <span className="block truncate text-[11px] text-text-muted">
            Browse {count} learning card{count === 1 ? '' : 's'}
          </span>
        </span>
        <span className="shrink-0 rounded-md border border-border bg-canvas px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-text-muted">
          {count}
        </span>
      </button>
    </div>
  );
}

function SourceButton({
  title,
  subtitle,
  icon,
  isActive,
  onClick,
}: {
  title: string;
  subtitle: string;
  icon?: ReactNode;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      className={[
        rowBase,
        rowHover,
        'my-0.5 flex-col items-stretch gap-0 border-l-[3px] border-transparent py-2 pl-[calc(0.625rem-3px)]',
        isActive
          ? 'semia-margin-active text-text'
          : 'text-text-secondary hover:text-text',
      ].join(' ')}
      onClick={onClick}
    >
      <span className="flex items-center gap-1.5">
        {icon ? (
          <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
            {icon}
          </span>
        ) : null}
        <span className="truncate text-[13px] font-medium leading-snug">{title}</span>
      </span>
      <span
        className={[
          'mt-0.5 truncate text-[11px] tabular-nums',
          icon ? 'pl-5' : '',
          isActive ? 'text-text-muted' : 'text-text-muted',
        ].join(' ')}
      >
        {subtitle}
      </span>
    </button>
  );
}

function EmptyHint({ children }: { children: ReactNode }) {
  return (
    <p className="px-2.5 py-2 text-[11px] leading-snug text-text-muted">
      {children}
    </p>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
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
