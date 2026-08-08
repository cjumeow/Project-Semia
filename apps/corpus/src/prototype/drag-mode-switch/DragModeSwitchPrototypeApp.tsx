import { useEffect, useState } from 'react';
import { DragModeChatPreview } from './DragModeChatPreview';
import {
  dragModeSwitchVariantForKey,
  readDragModeSwitchVariantKey,
  type DragModeSwitchVariantKey,
} from './dragModeSwitchVariants';
import { PrototypeSwitcher } from './PrototypeSwitcher';

/**
 * PROTOTYPE — drag mode toggle placements in AI assistant top bar.
 * ?prototype=drag-mode-switch&variant=A|B|C|D
 */
export function DragModeSwitchPrototypeApp() {
  const [variantKey, setVariantKey] =
    useState<DragModeSwitchVariantKey>(readDragModeSwitchVariantKey);
  const variant = dragModeSwitchVariantForKey(variantKey);

  useEffect(() => {
    const onPopState = (): void => {
      setVariantKey(readDragModeSwitchVariantKey());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return (
    <div
      className="drag-mode-proto relative min-h-screen bg-shelf px-4 py-8 text-text"
      data-semia-theme="dark"
    >
      <p className="mb-4 text-center font-mono text-[10px] text-text-muted">
        PROTOTYPE drag-mode-switch · {variant.key} {variant.label} — toggle in
        header; off = no drag chrome / no draggable
      </p>

      <DragModeChatPreview variant={variant.key} />

      <PrototypeSwitcher />
    </div>
  );
}
