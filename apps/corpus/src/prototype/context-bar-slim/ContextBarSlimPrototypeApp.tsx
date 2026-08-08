import { useEffect, useState } from 'react';
import './contextBarSlim.css';
import { ContextBarSlimPreview } from './ContextBarSlimPreview';
import {
  contextBarSlimVariantForKey,
  readContextBarSlimVariantKey,
  type ContextBarSlimVariantKey,
} from './contextBarSlimVariants';
import { PrototypeSwitcher } from './PrototypeSwitcher';
import { SnipContextWindowStub } from '../shared/SnipContextWindowStub';

/**
 * PROTOTYPE — slim context bar + minimal context-switch lines.
 * ?prototype=context-bar-slim&variant=A|B|C
 */
export function ContextBarSlimPrototypeApp() {
  const [variantKey, setVariantKey] = useState<ContextBarSlimVariantKey>(
    readContextBarSlimVariantKey,
  );
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const variant = contextBarSlimVariantForKey(variantKey);

  useEffect(() => {
    const onPopState = (): void => {
      setVariantKey(readContextBarSlimVariantKey());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return (
    <div className="relative min-h-screen bg-shelf px-4 py-6 pb-28 text-text">
      <div className="mb-4 flex flex-col items-center gap-3">
        <p className="text-center font-mono text-[10px] text-text-muted">
          PROTOTYPE context-bar-slim · {variant.key} {variant.label}
        </p>
        <div
          className="flex rounded-lg border border-border bg-surface p-0.5"
          role="group"
          aria-label="Preview theme"
        >
          <button
            type="button"
            className={[
              'rounded-md px-3 py-1 text-[11px] font-medium transition-colors',
              theme === 'light'
                ? 'bg-canvas text-text shadow-sm'
                : 'text-text-muted',
            ].join(' ')}
            onClick={() => setTheme('light')}
          >
            Light
          </button>
          <button
            type="button"
            className={[
              'rounded-md px-3 py-1 text-[11px] font-medium transition-colors',
              theme === 'dark'
                ? 'bg-canvas text-text shadow-sm'
                : 'text-text-muted',
            ].join(' ')}
            onClick={() => setTheme('dark')}
          >
            Dark
          </button>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-center text-[10px] font-medium uppercase tracking-wide text-text-muted">
            {theme === 'light' ? 'Light' : 'Dark'} · scroll to test sticky bar
          </p>
          <ContextBarSlimPreview variant={variant.key} theme={theme} />
          <div className="mt-4 rounded-2xl border border-border bg-surface p-4 shadow-sm">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-text-muted">
              Snip card · context window (same chevron)
            </p>
            <SnipContextWindowStub />
          </div>
        </div>
        <div className="hidden lg:block">
          <p className="mb-2 text-center text-[10px] font-medium uppercase tracking-wide text-text-muted">
            {theme === 'light' ? 'Dark' : 'Light'} · comparison
          </p>
          <ContextBarSlimPreview
            variant={variant.key}
            theme={theme === 'light' ? 'dark' : 'light'}
          />
          <div
            className="mt-4 rounded-2xl border border-border bg-surface p-4 shadow-sm"
            data-semia-theme={theme === 'light' ? 'dark' : undefined}
          >
            <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-text-muted">
              Snip card · context window
            </p>
            <SnipContextWindowStub />
          </div>
        </div>
      </div>

      <PrototypeSwitcher />
    </div>
  );
}
