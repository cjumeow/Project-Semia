import { useState } from 'react';
import { SEMIA_BUILD_ID } from '../buildInfo';
import type { VideoGroup } from '../types/corpus';

type SemiaSidebarProps = {
  groups: VideoGroup[];
  selectedVideoId: string | null;
  onSelectVideo: (videoId: string) => void;
};

export function SemiaSidebar({
  groups,
  selectedVideoId,
  onSelectVideo,
}: SemiaSidebarProps) {
  const [youtubeExpanded, setYoutubeExpanded] = useState(true);

  return (
    <aside className="flex h-full flex-col bg-surface">
      <header className="shrink-0 border-b border-border px-3 py-3">
        <h1 className="text-base font-semibold tracking-tight text-text">
          SEMIA
        </h1>
        <p className="mt-0.5 text-[10px] text-text-muted">
          Language snippets library
        </p>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <button
          type="button"
          className="flex w-full shrink-0 items-center gap-1.5 border-b border-border px-3 py-2 text-left transition-colors hover:bg-canvas"
          onClick={() => setYoutubeExpanded((v) => !v)}
          aria-expanded={youtubeExpanded}
        >
          <ChevronIcon expanded={youtubeExpanded} />
          <YouTubeIcon />
          <span className="text-xs font-medium text-text-secondary">
            YouTube
          </span>
          <span className="ml-auto text-[10px] tabular-nums text-text-muted">
            {groups.length}
          </span>
        </button>

        {youtubeExpanded && (
          <nav
            className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-1.5 py-1.5"
            aria-label="YouTube videos"
          >
            {groups.map((group) => {
              const isActive = group.meta.videoId === selectedVideoId;
              return (
                <button
                  key={group.meta.videoId}
                  type="button"
                  title={group.meta.title}
                  className={[
                    'mb-0.5 flex w-full flex-col rounded-md px-2 py-1.5 text-left transition-colors',
                    isActive
                      ? 'bg-accent-soft text-accent'
                      : 'text-text-secondary hover:bg-canvas hover:text-text',
                  ].join(' ')}
                  onClick={() => onSelectVideo(group.meta.videoId)}
                >
                  <span className="truncate text-xs font-medium leading-snug">
                    {group.meta.title}
                  </span>
                  <span className="mt-0.5 text-[10px] tabular-nums text-text-muted">
                    {group.snippets.length} snip
                  </span>
                </button>
              );
            })}
          </nav>
        )}
      </div>

      <footer className="shrink-0 border-t border-border px-3 py-2">
        <p className="font-mono text-[10px] text-text-muted">{SEMIA_BUILD_ID}</p>
      </footer>
    </aside>
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
