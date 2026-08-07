import { useCallback, useEffect } from 'react';
import {
  darkModeViewForKey,
  type DarkModeViewKey,
} from './darkModeVariants';

const VIEWS: Array<{ key: DarkModeViewKey; label: string }> = [
  { key: 'inbox', label: 'Inbox' },
  { key: 'cards', label: 'Learning cards grid' },
];

function readView(): DarkModeViewKey {
  return darkModeViewForKey(new URLSearchParams(window.location.search).get('view'));
}

export function ViewSwitcher() {
  const view = readView();

  const navigate = useCallback((next: DarkModeViewKey) => {
    const params = new URLSearchParams(window.location.search);
    params.set('prototype', 'dark-mode');
    params.set('view', next);
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}?${params.toString()}`,
    );
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === '1') navigate('inbox');
      if (event.key === '2') navigate('cards');
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navigate]);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-12 z-50 flex justify-center">
      <div className="pointer-events-auto flex rounded-full border border-border bg-surface/95 p-1 shadow-sm">
        {VIEWS.map((entry) => (
          <button
            key={entry.key}
            type="button"
            className={[
              'rounded-full px-3 py-1 text-[11px] font-medium transition-colors',
              entry.key === view
                ? 'bg-accent text-white'
                : 'text-text-secondary hover:text-text',
            ].join(' ')}
            onClick={() => navigate(entry.key)}
          >
            {entry.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function readDarkModeView(): DarkModeViewKey {
  return readView();
}
