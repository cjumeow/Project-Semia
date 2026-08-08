import { useEffect, useState } from 'react';
import { ContextTabsPreview } from './ContextTabsPreview';
import {
  contextTabsVariantForKey,
  readContextTabsVariantKey,
  type ContextTabsVariantKey,
} from './contextTabsVariants';
import { PrototypeSwitcher } from './PrototypeSwitcher';

/**
 * PROTOTYPE — context switcher + Snip/Language detail tabs.
 * ?prototype=context-tabs&variant=A|B|C|D|E|F  (D = golden layout default)
 */
export function ContextTabsPrototypeApp() {
  const [variantKey, setVariantKey] =
    useState<ContextTabsVariantKey>(readContextTabsVariantKey);
  const variant = contextTabsVariantForKey(variantKey);

  useEffect(() => {
    const onPopState = (): void => {
      setVariantKey(readContextTabsVariantKey());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return (
    <div className="relative min-h-screen bg-shelf px-4 py-8 pb-24 text-text">
      <p className="mb-4 text-center font-mono text-[10px] text-text-muted">
        PROTOTYPE context-tabs · {variant.key} {variant.label}
      </p>

      <ContextTabsPreview variant={variant.key} />

      <PrototypeSwitcher />
    </div>
  );
}
