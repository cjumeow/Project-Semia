import { useEffect, useState } from 'react';
import {
  PrototypeSwitcher,
  readYoutubeCaptionsVariant,
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
import { VariantG } from './variants/VariantG';
import { VariantH } from './variants/VariantH';
import { VariantI } from './variants/VariantI';
import { VariantJ } from './variants/VariantJ';
import { VariantK } from './variants/VariantK';
import { VariantL } from './variants/VariantL';

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
    case 'G':
      return <VariantG state={state} />;
    case 'H':
      return <VariantH state={state} />;
    case 'I':
      return <VariantI state={state} />;
    case 'J':
      return <VariantJ state={state} />;
    case 'K':
      return <VariantK state={state} />;
    case 'L':
      return <VariantL state={state} />;
  }
}

/**
 * YouTube subtitle settings + chrome prototypes.
 * ?prototype=youtube-captions&variant=A–L
 */
export function YoutubeCaptionsPrototypeApp() {
  const state = useYoutubeCaptionsPrototypeState();
  const [variant, setVariant] = useState<YoutubeCaptionsVariantKey>(
    readYoutubeCaptionsVariant,
  );

  useEffect(() => {
    const onPopState = (): void => setVariant(readYoutubeCaptionsVariant());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-[#0f0f0f] text-text">
      <header className="shrink-0 border-b border-white/10 bg-black px-4 py-2">
        <p className="font-mono text-[10px] text-amber-300/90">
          PROTOTYPE v4 — D–F = chrome shells · G–L = icon directions (same dark
          badge shell for fair compare). Far right placement. ← → to cycle A–L.
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
