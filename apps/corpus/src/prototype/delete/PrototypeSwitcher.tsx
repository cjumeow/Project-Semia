import { useCallback, useEffect } from 'react';
import { DELETE_STYLES } from './deleteStyles';

export type DeleteStyleKey = (typeof DELETE_STYLES)[number]['id'];

const STYLE_KEYS = new Set<string>(DELETE_STYLES.map((s) => s.id));

export function readDeleteVariant(): DeleteStyleKey {
  const value = new URLSearchParams(window.location.search).get('variant');
  if (value && STYLE_KEYS.has(value)) {
    return value as DeleteStyleKey;
  }
  return 'A';
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable
  );
}

export function PrototypeSwitcher() {
  const variant = readDeleteVariant();
  const current = DELETE_STYLES.find((item) => item.id === variant)!;
  const index = DELETE_STYLES.indexOf(current);

  const navigate = useCallback((nextIndex: number) => {
    const next =
      DELETE_STYLES[
        (nextIndex + DELETE_STYLES.length) % DELETE_STYLES.length
      ]!;
    const params = new URLSearchParams(window.location.search);
    params.set('prototype', 'delete');
    params.set('variant', next.id);
    window.history.replaceState(null, '', `${window.location.pathname}?${params}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (isEditableTarget(event.target)) return;
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        navigate(index - 1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        navigate(index + 1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [index, navigate]);

  if (import.meta.env.PROD) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border bg-surface px-2 py-1.5 shadow-lg">
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-canvas hover:text-text"
          aria-label="Previous variant"
          onClick={() => navigate(index - 1)}
        >
          ←
        </button>
        <p className="min-w-[14rem] text-center font-mono text-[11px] text-text">
          <span className="font-semibold">{current.id}</span>
          <span className="text-text-muted"> — {current.label}</span>
        </p>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-canvas hover:text-text"
          aria-label="Next variant"
          onClick={() => navigate(index + 1)}
        >
          →
        </button>
      </div>
    </div>
  );
}
