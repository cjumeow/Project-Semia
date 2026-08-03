import { useCallback, useEffect } from 'react';

export const YOUTUBE_CAPTIONS_VARIANTS = [
  { key: 'A', label: 'Legacy: before ⚙ popover', group: 'settings UX' },
  { key: 'B', label: 'Legacy: bottom sheet', group: 'settings UX' },
  { key: 'C', label: 'Legacy: toggle + chevron', group: 'settings UX' },
  { key: 'D', label: 'Chrome: Canopy forest badge', group: 'chrome shell' },
  { key: 'E', label: 'Chrome: Glass frosted circle', group: 'chrome shell' },
  { key: 'F', label: 'Chrome: Signal S·pill', group: 'chrome shell' },
  { key: 'G', label: 'Icon: semicolon ·', group: 'icons' },
  { key: 'H', label: 'Icon: brackets [ ]', group: 'icons' },
  { key: 'I', label: 'Icon: transcript arc', group: 'icons' },
  { key: 'J', label: 'Icon: layered S', group: 'icons' },
  { key: 'K', label: 'Icon: snippet tab', group: 'icons' },
  { key: 'L', label: 'Icon: bilingual stack', group: 'icons' },
] as const;

export type YoutubeCaptionsVariantKey =
  (typeof YOUTUBE_CAPTIONS_VARIANTS)[number]['key'];

const VALID_VARIANTS = new Set<string>(YOUTUBE_CAPTIONS_VARIANTS.map((v) => v.key));

export function readYoutubeCaptionsVariant(
  search = window.location.search,
): YoutubeCaptionsVariantKey {
  const value = new URLSearchParams(search).get('variant');
  if (value && VALID_VARIANTS.has(value)) {
    return value as YoutubeCaptionsVariantKey;
  }
  return 'G';
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
  const variant = readYoutubeCaptionsVariant();
  const current = YOUTUBE_CAPTIONS_VARIANTS.find((item) => item.key === variant)!;
  const index = YOUTUBE_CAPTIONS_VARIANTS.indexOf(current);

  const navigate = useCallback((nextIndex: number) => {
    const next =
      YOUTUBE_CAPTIONS_VARIANTS[
        (nextIndex + YOUTUBE_CAPTIONS_VARIANTS.length) %
          YOUTUBE_CAPTIONS_VARIANTS.length
      ]!;
    const params = new URLSearchParams(window.location.search);
    params.set('prototype', 'youtube-captions');
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
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[80] flex justify-center px-4">
      <div className="pointer-events-auto flex max-w-[95vw] items-center gap-2 rounded-full border border-border bg-surface px-2 py-1.5 shadow-lg">
        <button
          type="button"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-secondary hover:bg-canvas hover:text-text"
          aria-label="Previous variant"
          onClick={() => navigate(index - 1)}
        >
          ←
        </button>
        <p className="min-w-0 text-center font-mono text-[11px] text-text">
          <span className="font-semibold">{current.key}</span>
          <span className="text-text-muted"> — {current.label}</span>
        </p>
        <button
          type="button"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-secondary hover:bg-canvas hover:text-text"
          aria-label="Next variant"
          onClick={() => navigate(index + 1)}
        >
          →
        </button>
      </div>
    </div>
  );
}
