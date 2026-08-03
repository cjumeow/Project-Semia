import { useEffect, useState } from 'react';
import {
  PrototypeSwitcher,
  YOUTUBE_CAPTIONS_VARIANTS,
  type YoutubeCaptionsVariantKey,
} from './PrototypeSwitcher';
import { useYoutubeCaptionsPrototypeState } from './useYoutubeCaptionsPrototypeState';
import { VariantA } from './variants/VariantA';
import { VariantB } from './variants/VariantB';
import { VariantC } from './variants/VariantC';
import { VariantD } from './variants/VariantD';
import { VariantE } from './variants/VariantE';
import { VariantF } from './variants/VariantF';

function readVariant(): YoutubeCaptionsVariantKey {
  const value = new URLSearchParams(window.location.search).get('variant');
  if (
    value === 'A' ||
    value === 'B' ||
    value === 'C' ||
    value === 'D' ||
    value === 'E' ||
    value === 'F'
  ) {
    return value;
  }
  return 'D';
}

function VariantView({
  variant,
  state,
}: {
  variant: YoutubeCaptionsVariantKey;
  state: ReturnType<typeof useYoutubeCaptionsPrototypeState>;
}) {
  switch (variant) {
    case 'A':
      return <VariantA state={state} />;
    case 'B':
      return <VariantB state={state} />;
    case 'C':
      return <VariantC state={state} />;
    case 'D':
      return <VariantD state={state} />;
    case 'E':
      return <VariantE state={state} />;
    case 'F':
      return <VariantF state={state} />;
  }
}

/**
 * YouTube subtitle settings + chrome prototypes.
 * ?prototype=youtube-captions&variant=A|B|C|D|E|F
 */
export function YoutubeCaptionsPrototypeApp() {
  const state = useYoutubeCaptionsPrototypeState();
  const [variant, setVariant] = useState<YoutubeCaptionsVariantKey>(readVariant);

  useEffect(() => {
    const onPopState = (): void => setVariant(readVariant());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-[#0f0f0f] text-text">
      <header className="shrink-0 border-b border-white/10 bg-black px-4 py-2">
        <p className="font-mono text-[10px] text-amber-300/90">
          PROTOTYPE v4 — Chrome redesign: Semia on far right (Funlingo-style
          placement). D/E/F = visual directions; A/B/C = legacy settings UX.
          Click Semia control to open popover.
        </p>
      </header>
      <div className="flex min-h-0 flex-1">
        <VariantView variant={variant} state={state} />
      </div>
      <PrototypeSwitcher />
    </main>
  );
}

export { YOUTUBE_CAPTIONS_VARIANTS };
