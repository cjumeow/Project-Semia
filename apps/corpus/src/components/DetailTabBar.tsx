import type { DetailTab } from '../utils/languageCardInboxWorkspaceModel';

type DetailTabBarProps = {
  activeTab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
};

const TABS: Array<{ key: DetailTab; label: string }> = [
  { key: 'snip', label: 'Snip cards' },
  { key: 'language', label: 'Language cards' },
];

const TAB_TRACK_CLASS =
  'flex rounded-xl border border-zinc-300/40 bg-zinc-200/60 p-1 dark:border-zinc-700/50 dark:bg-zinc-800/80';

const TAB_ACTIVE_CLASS =
  'bg-white font-medium text-zinc-900 shadow-xs dark:bg-zinc-700 dark:text-white';

const TAB_INACTIVE_CLASS =
  'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white';

export function DetailTabBar({ activeTab, onTabChange }: DetailTabBarProps) {
  return (
    <div className="shrink-0 border-b border-border bg-surface px-4 py-3">
      <div role="tablist" aria-label="Capture detail tabs" className={TAB_TRACK_CLASS}>
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
                active ? TAB_ACTIVE_CLASS : TAB_INACTIVE_CLASS,
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
