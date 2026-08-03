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

function readVariant(): YoutubeCaptionsVariantKey {
  const value = new URLSearchParams(window.location.search).get('variant');
  if (value === 'B' || value === 'C') return value;
  return 'A';
}

/**
 * Three variants of YouTube subtitle settings (bottom bar only),
 * switchable via ?prototype=youtube-captions&variant=A|B|C
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
          PROTOTYPE v3 — Subtitle settings on YouTube bottom bar only (ADR-0002).
          LingoPanel = capture only, no settings. Bilingual pill is visual preview
          (dual-line deferred per spike #02).
        </p>
      </header>
      <div className="flex min-h-0 flex-1">
        {variant === 'A' ? (
          <VariantA state={state} />
        ) : variant === 'B' ? (
          <VariantB state={state} />
        ) : (
          <VariantC state={state} />
        )}
      </div>
      <PrototypeSwitcher />
    </main>
  );
}

export { YOUTUBE_CAPTIONS_VARIANTS };
