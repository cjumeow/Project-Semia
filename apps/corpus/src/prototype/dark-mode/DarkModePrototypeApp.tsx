import { useEffect, useState } from 'react';
import App from '../../App';
import { DarkModeThemeScope } from './DarkModeThemeScope';
import {
  darkModeVariantForKey,
  type DarkModeVariantKey,
} from './darkModeVariants';
import { PrototypeSwitcher } from './PrototypeSwitcher';

function readVariant(): DarkModeVariantKey {
  const value = new URLSearchParams(window.location.search).get('variant');
  if (value === 'B' || value === 'C') return value;
  return 'A';
}

/**
 * PROTOTYPE — Three dark color palettes on the real corpus App (layout unchanged).
 * Question: which dark token set is easiest on the eyes for daily use?
 */
export function DarkModePrototypeApp() {
  const [variantKey, setVariantKey] = useState<DarkModeVariantKey>(readVariant);
  const variant = darkModeVariantForKey(variantKey);

  useEffect(() => {
    const onPopState = (): void => setVariantKey(readVariant());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return (
    <div className="relative h-screen">
      <DarkModeThemeScope variant={variant}>
        <App />
      </DarkModeThemeScope>
      <div className="pointer-events-none absolute inset-x-0 top-3 z-50 flex justify-center">
        <p className="rounded-full border border-border bg-surface/95 px-3 py-1 font-mono text-[10px] text-text-muted shadow-sm">
          PROTOTYPE dark-mode · {variant.key} {variant.label} · layout unchanged
        </p>
      </div>
      <PrototypeSwitcher />
    </div>
  );
}
