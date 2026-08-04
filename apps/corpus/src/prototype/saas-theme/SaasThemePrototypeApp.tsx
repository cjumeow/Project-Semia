import { useEffect, useState } from 'react';
import { PrototypeSwitcher, type StyleVariantKey } from './PrototypeSwitcher';
import { SaasThemeView } from './SaasThemeView';
import { styleVariantForKey } from './styleVariants';
import { useInterFont } from './ThemeShell';
import {
  describeSaasThemeState,
  useSaasThemePrototypeState,
} from './useSaasThemePrototypeState';

function readVariant(): StyleVariantKey {
  const value = new URLSearchParams(window.location.search).get('variant');
  if (value === 'B' || value === 'C') return value;
  return 'A';
}

/**
 * PROTOTYPE — B theme + badge/intent style variants (A/B/C).
 */
export function SaasThemePrototypeApp() {
  useInterFont();
  const state = useSaasThemePrototypeState();
  const [variant, setVariant] = useState<StyleVariantKey>(readVariant);
  const styleVariant = styleVariantForKey(variant);

  useEffect(() => {
    const onPopState = (): void => setVariant(readVariant());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return (
    <div className="relative h-screen">
      <SaasThemeView state={state} styleVariant={styleVariant} />
      <div className="pointer-events-none absolute inset-x-0 top-3 z-50 flex justify-center">
        <p className="rounded-full border border-border bg-surface/95 px-3 py-1 font-mono text-[10px] text-text-muted shadow-sm">
          {styleVariant.key} {styleVariant.label} · {describeSaasThemeState(state)}
        </p>
      </div>
      <PrototypeSwitcher />
    </div>
  );
}
