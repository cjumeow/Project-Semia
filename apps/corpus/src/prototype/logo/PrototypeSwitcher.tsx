import { useCallback, useEffect } from 'react';

export const LOGO_VARIANTS = [
  { key: 'A', label: 'Pause Point — semicolon' },
  { key: 'B', label: 'Selection — brackets' },
  { key: 'C', label: 'Transcript Arc — wave' },
  { key: 'D', label: 'Layered S — monogram' },
  { key: 'E', label: 'Snippet Tab — index card' },
] as const;

export type LogoVariantKey = (typeof LOGO_VARIANTS)[number]['key'];

const VARIANT_KEYS = new Set<string>(LOGO_VARIANTS.map((v) => v.key));

export function readLogoVariant(): LogoVariantKey {
  const value = new URLSearchParams(window.location.search).get('variant');
  if (value && VARIANT_KEYS.has(value)) {
    return value as LogoVariantKey;
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
  const variant = readLogoVariant();
  const current = LOGO_VARIANTS.find((item) => item.key === variant)!;
  const index = LOGO_VARIANTS.indexOf(current);

  const navigate = useCallback((nextIndex: number) => {
    const next =
      LOGO_VARIANTS[
        (nextIndex + LOGO_VARIANTS.length) % LOGO_VARIANTS.length
      ]!;
    const params = new URLSearchParams(window.location.search);
    params.set('prototype', 'logo');
    params.set('variant', next.key);
    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', nextUrl);
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
        <p className="min-w-[16rem] text-center font-mono text-[11px] text-text">
          <span className="font-semibold">{current.key}</span>
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
