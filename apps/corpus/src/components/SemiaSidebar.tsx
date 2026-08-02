import { useState, type ReactNode } from 'react';
import { SEMIA_BUILD_ID } from '../buildInfo';
import type { CorpusPane, SourceGroup } from '../types/corpus';
import {
  pendingCountForSourceGroup,
  sourceSubtitleForGroup,
  webGroups,
  youtubeGroups,
} from '../utils/corpusGrouping';
import { SemiaLogo } from './SemiaLogo';
import {
  InboxIcon,
  LibraryIcon,
  ReviewQueueIcon,
  WebIcon,
  YouTubeIcon,
} from './SemiaNavIcons';

type SemiaSidebarProps = {
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
  const [inboxExpanded, setInboxExpanded] = useState(true);
  const [libraryExpanded, setLibraryExpanded] = useState(true);
  const [reviewQueueExpanded, setReviewQueueExpanded] = useState(true);
  const [youtubeExpanded, setYoutubeExpanded] = useState(true);
  const [webExpanded, setWebExpanded] = useState(true);

  const youtube = youtubeGroups(libraryGroups);
  const web = webGroups(libraryGroups);

  return (
    <aside className="flex h-full flex-col bg-shelf">
      <header className="shrink-0 border-b border-border/80 px-4 pb-4 pt-5">
        <SemiaLogo size="md" />
        <p className="mt-2 text-xs text-text-muted">
          Snippets from your immersion
        </p>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-2 pb-3">
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
                      <YouTubeIcon size={14} />
                    ) : (
                      <WebIcon size={14} />
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

            <button
              type="button"
              className={[
                rowBase,
                rowHover,
                'my-0.5 flex-col items-stretch gap-0 border-l-[3px] border-transparent py-2 pl-[calc(0.625rem-3px)]',
                pane === 'my-cards'
                  ? 'semia-margin-active text-accent shadow-sm'
                  : 'text-text-secondary hover:text-text',
              ].join(' ')}
              onClick={onSelectMyCards}
            >
              <span className="truncate text-xs font-medium leading-snug">
                My cards
              </span>
              <span
                className={[
                  'mt-0.5 truncate text-[10px] tabular-nums',
                  pane === 'my-cards' ? 'text-accent/70' : 'text-text-muted',
                ].join(' ')}
              >
                {myCardsCount} card{myCardsCount === 1 ? '' : 's'}
              </span>
            </button>
          </div>
        ) : null}

        <SidebarRow
          variant="section"
          expanded={reviewQueueExpanded}
          onToggle={() => setReviewQueueExpanded((value) => !value)}
          icon={<ReviewQueueIcon />}
          label="Review Queue"
          count={dueCount + dueCardCount}
          ariaLabel="Review Queue"
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
                  ? 'semia-margin-active text-accent shadow-sm'
                  : 'text-text-secondary hover:text-text',
              ].join(' ')}
              onClick={onSelectReviewQueue}
            >
              <span className="truncate text-xs font-medium leading-snug">
                Snippets due
              </span>
              <span
                className={[
                  'mt-0.5 truncate text-[10px] tabular-nums',
                  pane === 'review-queue' ? 'text-accent/70' : 'text-text-muted',
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
                  ? 'semia-margin-active text-accent shadow-sm'
                  : 'text-text-secondary hover:text-text',
              ].join(' ')}
              onClick={onSelectCardReviewQueue}
            >
              <span className="truncate text-xs font-medium leading-snug">
                Cards due
              </span>
              <span
                className={[
                  'mt-0.5 truncate text-[10px] tabular-nums',
                  pane === 'card-review-queue'
                    ? 'text-accent/70'
                    : 'text-text-muted',
                ].join(' ')}
              >
                {dueCardCount} card{dueCardCount === 1 ? '' : 's'}
              </span>
            </button>
          </div>
        ) : null}
      </div>

      <footer className="shrink-0 border-t border-border/60 px-4 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            className="rounded-md px-2 py-1 text-[11px] font-medium text-text-secondary hover:bg-canvas hover:text-text"
            onClick={onOpenSettings}
          >
            Settings
          </button>
          <p className="font-mono text-[10px] text-text-muted">{SEMIA_BUILD_ID}</p>
        </div>
      </footer>
    </aside>
  );
}

const rowBase =
  'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left transition-[background-color,color,box-shadow,border-color] duration-150';

const rowHover = 'hover:bg-black/[0.04]';

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
            ? 'text-xs font-medium text-text-muted'
            : isFolder
              ? 'text-xs font-medium text-text-secondary'
              : 'text-xs font-medium',
        ].join(' ')}
      >
        {label}
      </span>
      {count !== undefined ? (
        <span className="shrink-0 text-[10px] tabular-nums text-text-muted">
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
          ? 'semia-margin-active text-accent shadow-sm'
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
        <span className="truncate text-xs font-medium leading-snug">{title}</span>
      </span>
      <span
        className={[
          'mt-0.5 truncate text-[10px] tabular-nums',
          icon ? 'pl-5' : '',
          isActive ? 'text-accent/70' : 'text-text-muted',
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
