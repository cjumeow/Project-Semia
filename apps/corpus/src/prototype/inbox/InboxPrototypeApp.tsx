import { useEffect, useState } from 'react';
import {
  INBOX_PROTOTYPE_VARIANTS,
  type InboxPrototypeVariantKey,
  PrototypeSwitcher,
} from './PrototypeSwitcher';
import { useInboxPrototypeState } from './useInboxPrototypeState';
import { VariantA } from './variants/VariantA';
import { VariantB } from './variants/VariantB';
import { VariantC } from './variants/VariantC';

function readVariant(): InboxPrototypeVariantKey {
  const value = new URLSearchParams(window.location.search).get('variant');
  if (value === 'B' || value === 'C') return value;
  return 'A';
}

export function InboxPrototypeApp() {
  const state = useInboxPrototypeState();
  const [variant, setVariant] = useState<InboxPrototypeVariantKey>(readVariant);

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

export { INBOX_PROTOTYPE_VARIANTS };
