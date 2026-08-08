import { useCallback, useEffect } from 'react';
import {
  CONTEXT_BAR_SLIM_VARIANTS,
  readContextBarSlimVariantKey,
} from './contextBarSlimVariants';

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
  const variant = readContextBarSlimVariantKey();
  const current = CONTEXT_BAR_SLIM_VARIANTS.find((entry) => entry.key === variant)!;
  const index = CONTEXT_BAR_SLIM_VARIANTS.indexOf(current);

  const navigate = useCallback((nextIndex: number) => {
    const next =
      CONTEXT_BAR_SLIM_VARIANTS[
        (nextIndex + CONTEXT_BAR_SLIM_VARIANTS.length) %
          CONTEXT_BAR_SLIM_VARIANTS.length
      ]!;
    const params = new URLSearchParams(window.location.search);
    params.set('prototype', 'context-bar-slim');
    params.set('variant', next.key);
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}?${params.toString()}`,
    );
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
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4">
      <div className="proto-switcher-pill pointer-events-auto max-w-xl rounded-full border border-border bg-surface/95 px-3 py-2 shadow-lg">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary hover:bg-canvas"
            aria-label="Previous variant"
            onClick={() => navigate(index - 1)}
          >
            ←
          </button>
          <p className="min-w-[16rem] flex-1 text-center font-mono text-[11px] text-text">
            <span className="font-semibold">{current.key}</span>
            <span className="text-text-muted"> — {current.label}</span>
          </p>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary hover:bg-canvas"
            aria-label="Next variant"
            onClick={() => navigate(index + 1)}
          >
            →
          </button>
        </div>
        <p className="mt-1 text-center text-[10px] text-text-muted">
          {current.description}
        </p>
      </div>
    </div>
  );
}
