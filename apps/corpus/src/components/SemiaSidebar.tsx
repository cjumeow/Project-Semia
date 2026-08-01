import { useState, type ReactNode } from 'react';
import { SEMIA_BUILD_ID } from '../buildInfo';
import type { SourceGroup } from '../types/corpus';
import { webGroups, youtubeGroups } from '../utils/corpusGrouping';
import {
  LibraryIcon,
  WebIcon,
  YouTubeIcon,
} from './SemiaNavIcons';

type SemiaSidebarProps = {
  groups: SourceGroup[];
  selectedSourceKey: string | null;
  onSelectSource: (sourceKey: string) => void;
};

export function SemiaSidebar({
  groups,
  selectedSourceKey,
  onSelectSource,
}: SemiaSidebarProps) {
  const [libraryExpanded, setLibraryExpanded] = useState(true);
  const [youtubeExpanded, setYoutubeExpanded] = useState(true);
  const [webExpanded, setWebExpanded] = useState(true);

  const youtube = youtubeGroups(groups);
  const web = webGroups(groups);
  const libraryCount = youtube.length + web.length;

  return (
    <aside className="flex h-full flex-col bg-shelf">
      <header className="shrink-0 border-b border-border/80 px-4 pb-4 pt-5">
        <h1 className="font-display text-[1.35rem] font-semibold tracking-tight text-text">
          SEMIA
        </h1>
        <p className="mt-1 text-xs text-text-muted">
          Snippets from your immersion
        </p>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-2 pb-3">
        <SidebarRow
          variant="section"
          expanded={libraryExpanded}
          onToggle={() => setLibraryExpanded((value) => !value)}
          icon={<LibraryIcon />}
          label="Library"
          count={libraryCount}
          ariaLabel="Library"
        />

        {libraryExpanded ? (
          <div className="mt-0.5 space-y-0.5 pl-2">
            <SidebarFolder
              title="YouTube"
              count={youtube.length}
              expanded={youtubeExpanded}
              onToggle={() => setYoutubeExpanded((value) => !value)}
              icon={<YouTubeIcon />}
              ariaLabel="YouTube videos"
            >
              {youtube.length === 0 ? (
                <EmptyHint>No YouTube captures yet</EmptyHint>
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
                    isActive={group.meta.sourceKey === selectedSourceKey}
                    onClick={() => onSelectSource(group.meta.sourceKey)}
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
                <EmptyHint>No web captures yet</EmptyHint>
              ) : (
                web.map((group) => (
                  <SourceButton
                    key={group.meta.sourceKey}
                    title={group.meta.title}
                    subtitle={
                      group.meta.kind === 'web'
                        ? group.meta.hostname
                        : group.meta.sourceUrl
                    }
                    isActive={group.meta.sourceKey === selectedSourceKey}
                    onClick={() => onSelectSource(group.meta.sourceKey)}
                  />
                ))
              )}
            </SidebarFolder>
          </div>
        ) : null}
      </div>

      <footer className="shrink-0 px-4 py-2.5">
        <p className="font-mono text-[10px] text-text-muted">{SEMIA_BUILD_ID}</p>
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
}: {
  variant: 'section' | 'folder';
  expanded?: boolean;
  onToggle: () => void;
  icon?: ReactNode;
  label: string;
  count?: number;
  ariaLabel?: string;
}) {
  const isSection = variant === 'section';
  const isFolder = variant === 'folder';

  return (
    <button
      type="button"
      className={[
        rowBase,
        rowHover,
        isFolder ? 'text-text-secondary' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onToggle}
      aria-expanded={expanded}
      aria-label={ariaLabel ?? label}
    >
      <ChevronIcon expanded={expanded ?? false} />
      {icon ? <span className="flex h-4 w-4 shrink-0 items-center justify-center">{icon}</span> : null}
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
  icon: ReactNode;
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
        <nav
          className="mt-0.5 space-y-0.5 pl-3"
          aria-label={ariaLabel}
        >
          {children}
        </nav>
      ) : null}
    </div>
  );
}

function SourceButton({
  title,
  subtitle,
  isActive,
  onClick,
}: {
  title: string;
  subtitle: string;
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
      <span className="truncate text-xs font-medium leading-snug">{title}</span>
      <span
        className={[
          'mt-0.5 truncate text-[10px] tabular-nums',
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
