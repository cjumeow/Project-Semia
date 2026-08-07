import type { DetailTab } from '../utils/languageCardInboxWorkspaceModel';

type DetailTabBarProps = {
  activeTab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
};

const TABS: Array<{ key: DetailTab; label: string }> = [
  { key: 'snip', label: 'Snip cards' },
  { key: 'language', label: 'Language cards' },
];

export function DetailTabBar({ activeTab, onTabChange }: DetailTabBarProps) {
  return (
    <div
      className="shrink-0 border-b border-border bg-surface px-5 py-3"
      role="tablist"
      aria-label="Capture detail tabs"
    >
      <div className="flex gap-2">
        {TABS.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              className={[
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                active
                  ? 'semia-selection-tab-active'
                  : 'border border-border text-text-secondary hover:border-accent/50 hover:text-text',
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
