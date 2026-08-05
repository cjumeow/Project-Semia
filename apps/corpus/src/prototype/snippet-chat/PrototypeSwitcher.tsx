import { useCallback, useEffect } from 'react';

export const SNIPPET_CHAT_VARIANTS = [
  { key: 'A', label: 'Full-bleed middle overlay' },
  { key: 'B', label: 'Right-docked copilot (~58%)' },
  { key: 'C', label: 'Split middle — list top, chat bottom' },
] as const;

export type SnippetChatVariantKey =
  (typeof SNIPPET_CHAT_VARIANTS)[number]['key'];

function readVariant(): SnippetChatVariantKey {
  const value = new URLSearchParams(window.location.search).get('variant');
  if (value === 'B' || value === 'C') return value;
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
  const variant = readVariant();
  const current = SNIPPET_CHAT_VARIANTS.find((item) => item.key === variant)!;
  const index = SNIPPET_CHAT_VARIANTS.indexOf(current);

  const navigate = useCallback((nextIndex: number) => {
    const next =
      SNIPPET_CHAT_VARIANTS[
        (nextIndex + SNIPPET_CHAT_VARIANTS.length) % SNIPPET_CHAT_VARIANTS.length
      ]!;
    const params = new URLSearchParams(window.location.search);
    params.set('prototype', 'snippet-chat');
    params.set('variant', next.key);
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
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
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[80] flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border bg-surface px-2 py-1.5 shadow-lg">
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary hover:bg-canvas hover:text-text"
          aria-label="Previous variant"
          onClick={() => navigate(index - 1)}
        >
          ←
        </button>
        <p className="min-w-[16rem] text-center font-mono text-[11px] text-text">
          <span className="font-semibold">{current.key}</span>
          <span className="text-text-muted"> — {current.label}</span>
        </p>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary hover:bg-canvas hover:text-text"
          aria-label="Next variant"
          onClick={() => navigate(index + 1)}
        >
          →
        </button>
      </div>
    </div>
  );
}
