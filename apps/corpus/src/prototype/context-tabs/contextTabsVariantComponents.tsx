import { useState } from 'react';
import type { ContextTabsMockSnippet } from './contextTabsMockData';
import { ContextWindowChevron } from './ContextWindowChevron';

type DetailTab = 'snip' | 'language';

type ProtoDetailTabBarProps = {
  activeTab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
};

const TABS: Array<{ key: DetailTab; label: string }> = [
  { key: 'snip', label: 'Snip cards' },
  { key: 'language', label: 'Language cards' },
];

export function VariantADetailTabBar({
  activeTab,
  onTabChange,
}: ProtoDetailTabBarProps) {
  return (
    <div className="shrink-0 border-b border-border bg-surface px-5">
      <div role="tablist" aria-label="Capture detail tabs" className="flex gap-6">
        {TABS.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              className={[
                '-mb-px border-b-2 pb-2.5 pt-3 text-xs font-medium transition-colors',
                active
                  ? 'border-accent text-text'
                  : 'border-transparent text-text-muted hover:text-text',
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

export function VariantBDetailTabBar({
  activeTab,
  onTabChange,
}: ProtoDetailTabBarProps) {
  return (
    <div className="shrink-0 border-b border-border bg-surface px-4 py-3">
      <div
        role="tablist"
        aria-label="Capture detail tabs"
        className="inline-flex rounded-xl border border-zinc-300/40 bg-zinc-200/60 p-1 dark:border-zinc-700/50 dark:bg-zinc-800/80"
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
                'rounded-lg px-3 py-1 text-xs transition-all',
                active
                  ? 'rounded-lg bg-white font-medium text-zinc-900 shadow-xs dark:bg-zinc-700 dark:text-white'
                  : 'rounded-lg text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white',
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

export function VariantCDetailTabBar({
  activeTab,
  onTabChange,
}: ProtoDetailTabBarProps) {
  return (
    <div
      role="tablist"
      aria-label="Capture detail tabs"
      className="flex shrink-0 border-b border-border bg-surface"
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
              'flex-1 py-3 text-center text-xs font-medium transition-colors',
              active
                ? 'border-b-2 border-accent bg-accent-soft/40 text-text'
                : 'text-text-muted hover:bg-canvas hover:text-text',
            ].join(' ')}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

type ProtoContextSwitcherProps = {
  snippets: ContextTabsMockSnippet[];
  activeSnippetId: string;
  onSelectSnippet: (id: string) => void;
};

export function VariantAContextSwitcher({
  snippets,
  activeSnippetId,
  onSelectSnippet,
}: ProtoContextSwitcherProps) {
  const [open, setOpen] = useState(false);
  const active =
    snippets.find((snippet) => snippet.id === activeSnippetId) ?? snippets[0];

  return (
    <div className="relative shrink-0">
      <div className="flex max-w-[13rem] overflow-hidden rounded-md border border-border bg-surface">
        <span className="flex shrink-0 items-center border-r border-border bg-canvas px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-text-muted">
          Context
        </span>
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-1.5 px-2 py-1 text-left text-xs text-text transition-colors hover:bg-canvas"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          <span className="min-w-0 flex-1 truncate font-reading">
            {active?.selectedText ?? 'Select capture'}
          </span>
          <ContextWindowChevron expanded={open} />
        </button>
      </div>

      {open ? (
        <ContextDropdown
          snippets={snippets}
          activeSnippetId={activeSnippetId}
          onSelect={(id) => {
            onSelectSnippet(id);
            setOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}

export function VariantBContextSwitcher({
  snippets,
  activeSnippetId,
  onSelectSnippet,
}: ProtoContextSwitcherProps) {
  const [open, setOpen] = useState(false);
  const active =
    snippets.find((snippet) => snippet.id === activeSnippetId) ?? snippets[0];

  return (
    <div className="relative w-52 shrink-0">
      <div className="semia-context-collapsed">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors hover:bg-black/[0.03]"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          <span className="text-xs font-medium text-text">Context</span>
          <ContextWindowChevron expanded={open} />
        </button>
        {open ? (
          <div className="border-t border-border px-3 py-2">
            <p className="truncate font-reading text-xs text-text-secondary">
              {active?.selectedText}
            </p>
            <p className="mt-1 truncate text-[10px] text-text-muted">
              {active?.sourceTitle}
            </p>
          </div>
        ) : (
          <div className="border-t border-border px-3 py-2">
            <p className="truncate font-reading text-xs text-text">
              {active?.selectedText}
            </p>
          </div>
        )}
      </div>

      {open ? (
        <ContextDropdown
          snippets={snippets}
          activeSnippetId={activeSnippetId}
          onSelect={(id) => {
            onSelectSnippet(id);
            setOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}

export function VariantCContextSwitcher({
  snippets,
  activeSnippetId,
  onSelectSnippet,
}: ProtoContextSwitcherProps) {
  const [open, setOpen] = useState(false);
  const active =
    snippets.find((snippet) => snippet.id === activeSnippetId) ?? snippets[0];

  return (
    <div className="relative min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-text-muted">
          Context
        </span>
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5 text-left transition-colors hover:bg-canvas"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          <span className="min-w-0 truncate font-reading text-xs text-text">
            {active?.selectedText ?? 'Select capture'}
          </span>
          <ContextWindowChevron expanded={open} />
        </button>
      </div>

      {open ? (
        <ContextDropdown
          snippets={snippets}
          activeSnippetId={activeSnippetId}
          onSelect={(id) => {
            onSelectSnippet(id);
            setOpen(false);
          }}
          align="left"
        />
      ) : null}
    </div>
  );
}

function ContextDropdown({
  snippets,
  activeSnippetId,
  onSelect,
  align = 'right',
}: {
  snippets: ContextTabsMockSnippet[];
  activeSnippetId: string;
  onSelect: (id: string) => void;
  align?: 'left' | 'right';
}) {
  return (
    <div
      className={[
        'absolute top-[calc(100%+6px)] z-30 w-64 rounded-xl border border-border bg-surface p-2.5 shadow-xl',
        align === 'right' ? 'right-0' : 'left-0',
      ].join(' ')}
    >
      <p className="text-[10px] font-medium uppercase tracking-wide text-text-muted">
        Switch context
      </p>
      <ul className="mt-1.5 max-h-48 overflow-y-auto">
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
