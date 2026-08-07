import { useEffect, useState } from 'react';
import { DarkModeCardsPreview } from './DarkModeCardsPreview';
import { DarkModeInboxPreview } from './DarkModeInboxPreview';
import { DarkModeThemeScope } from './DarkModeThemeScope';
import {
  darkModeVariantForKey,
  type DarkModeVariantKey,
} from './darkModeVariants';
import { PrototypeSwitcher } from './PrototypeSwitcher';
import { readDarkModeView, ViewSwitcher } from './ViewSwitcher';

function readVariant(): DarkModeVariantKey {
  const value = new URLSearchParams(window.location.search).get('variant');
  if (value === 'B' || value === 'C') return value;
  return 'A';
}

/**
 * PROTOTYPE — Cursor-style dark tokens on mock Inbox + Learning cards grid.
 * ?prototype=dark-mode&view=inbox|cards&variant=A|B|C
 */
export function DarkModePrototypeApp() {
  const [variantKey, setVariantKey] = useState<DarkModeVariantKey>(readVariant);
  const [view, setView] = useState(readDarkModeView);
  const variant = darkModeVariantForKey(variantKey);

  useEffect(() => {
    const onPopState = (): void => {
      setVariantKey(readVariant());
      setView(readDarkModeView());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return (
    <div className="relative h-screen overflow-hidden bg-canvas text-text">
      <DarkModeThemeScope variant={variant}>
        {view === 'cards' ? <DarkModeCardsPreview /> : <DarkModeInboxPreview />}
      </DarkModeThemeScope>
      <div className="pointer-events-none absolute inset-x-0 top-3 z-50 flex justify-center">
        <p className="rounded-full border border-border bg-surface/95 px-3 py-1 font-mono text-[10px] text-text-muted shadow-sm">
          PROTOTYPE dark-mode · {variant.key} {variant.label} · view={view}
        </p>
      </div>
      <ViewSwitcher />
      <PrototypeSwitcher />
    </div>
  );
}
