import { useState, type ReactNode } from 'react';
import { SEMIA_BUILD_ID } from '../buildInfo';
import type { SourceGroup } from '../types/corpus';
import { webGroups, youtubeGroups } from '../utils/corpusGrouping';

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
  const [youtubeExpanded, setYoutubeExpanded] = useState(true);
  const [webExpanded, setWebExpanded] = useState(true);

  const youtube = youtubeGroups(groups);
  const web = webGroups(groups);

  return (
    <aside className="flex h-full flex-col bg-surface">
      <header className="shrink-0 border-b border-border px-3 py-3">
        <h1 className="text-xl font-semibold tracking-tight text-text">
          SEMIA
        </h1>
        <p className="mt-0.5 text-[13px] text-text-muted">
          Language snippets library
        </p>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SidebarSection
          title="YouTube"
          count={youtube.length}
          expanded={youtubeExpanded}
          onToggle={() => setYoutubeExpanded((value) => !value)}
          icon={<YouTubeIcon />}
          ariaLabel="YouTube videos"
        >
          {youtube.map((group) => (
            <SourceButton
              key={group.meta.sourceKey}
              title={group.meta.title}
              subtitle={`${group.snippets.length} snip`}
              isActive={group.meta.sourceKey === selectedSourceKey}
              onClick={() => onSelectSource(group.meta.sourceKey)}
            />
          ))}
        </SidebarSection>

        <SidebarSection
          title="Web"
          count={web.length}
          expanded={webExpanded}
          onToggle={() => setWebExpanded((value) => !value)}
          icon={<WebIcon />}
          ariaLabel="Web pages"
        >
          {web.map((group) => (
            <SourceButton
              key={group.meta.sourceKey}
              title={group.meta.title}
              subtitle={
                group.meta.kind === 'web' ? group.meta.hostname : group.meta.sourceUrl
              }
              isActive={group.meta.sourceKey === selectedSourceKey}
              onClick={() => onSelectSource(group.meta.sourceKey)}
            />
          ))}
        </SidebarSection>
      </div>

      <footer className="shrink-0 border-t border-border px-3 py-2">
        <p className="font-mono text-[10px] text-text-muted">{SEMIA_BUILD_ID}</p>
      </footer>
    </aside>
  );
}

function SidebarSection({
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
    <>
      <button
        type="button"
        className="flex w-full shrink-0 items-center gap-1.5 border-b border-border px-3 py-2 text-left transition-colors hover:bg-canvas"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <ChevronIcon expanded={expanded} />
        {icon}
        <span className="text-xs font-medium text-text-secondary">{title}</span>
        <span className="ml-auto text-[10px] tabular-nums text-text-muted">
          {count}
        </span>
      </button>

      {expanded ? (
        <nav
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-1.5 py-1.5"
          aria-label={ariaLabel}
        >
          {children}
        </nav>
      ) : null}
    </>
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
        'mb-0.5 flex w-full flex-col rounded-md px-2 py-1.5 text-left transition-colors',
        isActive
          ? 'bg-accent-soft text-accent'
          : 'text-text-secondary hover:bg-canvas hover:text-text',
      ].join(' ')}
      onClick={onClick}
    >
      <span className="truncate text-xs font-medium leading-snug">{title}</span>
      <span className="mt-0.5 truncate text-[10px] tabular-nums text-text-muted">
        {subtitle}
      </span>
    </button>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={`shrink-0 text-text-muted transition-transform ${expanded ? 'rotate-90' : ''}`}
      aria-hidden
    >
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="shrink-0 text-red-500"
      aria-hidden
    >
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.7 31.7 0 0 0 0 12a31.7 31.7 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.7 31.7 0 0 0 24 12a31.7 31.7 0 0 0-.5-5.8zM9.7 15.5V8.5L15.8 12l-6.1 3.5z" />
    </svg>
  );
}

function WebIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="shrink-0 text-sky-600"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </svg>
  );
}
