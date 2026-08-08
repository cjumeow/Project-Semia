import { useState } from 'react';
import type { ContextTabsMockSnippet } from './contextTabsMockData';
import { ContextWindowChevron } from './ContextWindowChevron';

type DetailTab = 'snip' | 'language';

const TABS: Array<{ key: DetailTab; label: string }> = [
  { key: 'snip', label: 'Snip cards' },
  { key: 'language', label: 'Language cards' },
];

/** Gemini tweak #1 — full-width pill segmented control (iOS / Raycast style). */
export function VariantGoldenDetailTabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
}) {
  return (
    <div className="shrink-0 border-b border-border bg-surface px-4 py-3">
      <div
        role="tablist"
        aria-label="Capture detail tabs"
        className="flex rounded-xl border border-zinc-300/40 bg-zinc-200/60 p-1 dark:border-zinc-700/50 dark:bg-zinc-800/80"
      >
        {TABS.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              className={[
                'flex-1 rounded-lg py-1.5 text-xs transition-all',
                active
                  ? 'bg-white font-medium text-zinc-900 shadow-xs dark:bg-zinc-700 dark:text-white'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white',
              ].join(' ')}
              onClick={() => onTabChange(tab.key)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Gemini tweak #3 — compact Read | Drag pill in a single header row. */
export function GoldenCompactChatHeader({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5">
      <div className="min-w-0">
        <p className="font-display text-sm font-semibold text-text">AI assistant</p>
        <p className="text-[11px] text-text-muted">Global thread</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <div
          className="flex rounded-md border border-border bg-canvas p-0.5"
          role="group"
          aria-label="Chat interaction mode"
        >
          <span className="rounded px-2 py-0.5 text-[10px] font-medium text-text shadow-sm bg-surface">
            Read
          </span>
          <span className="rounded px-2 py-0.5 text-[10px] font-medium text-text-muted">
            Drag
          </span>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-md border border-border px-2 py-1 text-[11px] text-text-secondary transition-colors hover:bg-canvas hover:text-text"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}

type StickyContextBannerProps = {
  snippets: ContextTabsMockSnippet[];
  activeSnippetId: string;
  onSelectSnippet: (id: string) => void;
  /** D = expanded by default; E = collapsed; F = compact one-line rail */
  mode: 'expanded' | 'collapsed' | 'compact';
};

/**
 * Gemini tweak #2 — sticky context anchor inside the chat scroll area.
 * Stays pinned while messages scroll underneath.
 */
export function StickyContextBanner({
  snippets,
  activeSnippetId,
  onSelectSnippet,
  mode,
}: StickyContextBannerProps) {
  const [expanded, setExpanded] = useState(mode === 'expanded');
  const [pickerOpen, setPickerOpen] = useState(false);
  const active =
    snippets.find((snippet) => snippet.id === activeSnippetId) ?? snippets[0];

  const showFullText = mode === 'expanded' || expanded;

  return (
    <div className="sticky top-0 z-10 -mx-4 mb-3 border-b border-accent/10 bg-surface/95 px-4 pb-3 pt-2 backdrop-blur-sm">
      <div className="rounded-lg border border-accent/25 bg-accent-soft/60 shadow-sm">
        <div className="flex items-start gap-2.5 px-3 py-2.5">
          <span className="mt-0.5 shrink-0 text-sm leading-none" aria-hidden>
            📌
          </span>
          <button
            type="button"
            className="min-w-0 flex-1 text-left transition-colors hover:opacity-90"
            aria-expanded={showFullText}
            onClick={() => {
              if (mode !== 'expanded') {
                setExpanded((current) => !current);
              }
            }}
          >
            <span className="block text-[10px] font-semibold uppercase tracking-wide text-accent">
              Context
            </span>
            <span
              className={[
                'mt-0.5 block font-reading text-xs leading-snug text-text',
                showFullText ? '' : 'truncate',
              ].join(' ')}
            >
              {active?.selectedText ?? 'Select capture'}
            </span>
            {showFullText && active?.sourceTitle ? (
              <span className="mt-1 block truncate text-[10px] text-text-muted">
                {active.sourceTitle}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            className="shrink-0 rounded p-0.5 text-text-muted hover:bg-surface/80"
            aria-label="Switch context"
            aria-expanded={pickerOpen}
            onClick={() => setPickerOpen((current) => !current)}
          >
            <ContextWindowChevron expanded={pickerOpen} />
          </button>
        </div>
      </div>

      {pickerOpen ? (
        <ContextPicker
          snippets={snippets}
          activeSnippetId={activeSnippetId}
          onSelect={(id) => {
            onSelectSnippet(id);
            setPickerOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}

function ContextPicker({
  snippets,
  activeSnippetId,
  onSelect,
}: {
  snippets: ContextTabsMockSnippet[];
  activeSnippetId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="mt-2 rounded-xl border border-border bg-surface p-2.5 shadow-lg">
      <p className="text-[10px] font-medium uppercase tracking-wide text-text-muted">
        Switch context
      </p>
      <ul className="mt-1.5 max-h-40 overflow-y-auto">
        {snippets.map((snippet) => {
          const active = snippet.id === activeSnippetId;
          return (
            <li key={snippet.id}>
              <button
                type="button"
                className={[
                  'flex w-full flex-col gap-0.5 rounded-md px-2 py-1.5 text-left transition-colors',
                  active
                    ? 'bg-accent-soft text-text'
                    : 'text-text-secondary hover:bg-canvas hover:text-text',
                ].join(' ')}
                onClick={() => onSelect(snippet.id)}
              >
                <span className="truncate text-xs font-medium font-reading">
                  {snippet.selectedText}
                </span>
                <span className="truncate text-[10px] text-text-muted">
                  {snippet.sourceTitle}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
