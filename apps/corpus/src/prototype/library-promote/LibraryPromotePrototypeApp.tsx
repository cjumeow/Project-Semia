import { useEffect, useState } from 'react';
import {
  LIBRARY_PROMOTE_VARIANTS,
  type LibraryPromoteVariantKey,
  PrototypeSwitcher,
} from './PrototypeSwitcher';
import { useLibraryPromotePrototypeState } from './useLibraryPromotePrototypeState';
import { VariantA } from './variants/VariantA';
import { VariantB } from './variants/VariantB';
import { VariantC } from './variants/VariantC';

function readVariant(): LibraryPromoteVariantKey {
  const value = new URLSearchParams(window.location.search).get('variant');
  if (value === 'B' || value === 'C') return value;
  return 'A';
}

/** Three variants for promoting review → mastered on the AI note card. */
export function LibraryPromotePrototypeApp() {
  const state = useLibraryPromotePrototypeState();
  const [variant, setVariant] = useState<LibraryPromoteVariantKey>(readVariant);

  useEffect(() => {
    const onPopState = (): void => {
      setVariant(readVariant());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return (
    <main className="flex h-screen overflow-hidden bg-canvas text-text">
      {variant === 'A' ? (
        <VariantA state={state} />
      ) : variant === 'B' ? (
        <VariantB state={state} />
      ) : (
        <VariantC state={state} />
      )}
      <PrototypeSwitcher />
    </main>
  );
}

export { LIBRARY_PROMOTE_VARIANTS };
