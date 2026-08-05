import { useEffect, useState } from 'react';
import {
  PrototypeSwitcher,
  SNIPPET_CHAT_VARIANTS,
  type SnippetChatVariantKey,
} from './PrototypeSwitcher';
import { useSnippetChatPrototypeState } from './useSnippetChatPrototypeState';
import { VariantA } from './variants/VariantA';
import { VariantB } from './variants/VariantB';
import { VariantC } from './variants/VariantC';

function readVariant(): SnippetChatVariantKey {
  const value = new URLSearchParams(window.location.search).get('variant');
  if (value === 'B' || value === 'C') return value;
  return 'A';
}

/**
 * Snippet chat + right-column card detail — three layout variants.
 * ?prototype=snippet-chat&variant=A|B|C
 */
export function SnippetChatPrototypeApp() {
  const [variant, setVariant] = useState<SnippetChatVariantKey>(readVariant);
  const state = useSnippetChatPrototypeState(variant);

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

export { SNIPPET_CHAT_VARIANTS };
