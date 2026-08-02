import { useEffect, useState } from 'react';
import {
  LOGO_VARIANTS,
  type LogoVariantKey,
  PrototypeSwitcher,
  readLogoVariant,
} from './PrototypeSwitcher';
import { LogoPresentation } from './prototypeShared';
import { variantA } from './variants/VariantA';
import { variantB } from './variants/VariantB';
import { variantC } from './variants/VariantC';
import { variantD } from './variants/VariantD';
import { variantE } from './variants/VariantE';

const VARIANT_MAP = {
  A: variantA,
  B: variantB,
  C: variantC,
  D: variantD,
  E: variantE,
} as const;

const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700&family=Syne:wght@700;800&display=swap';

/** Five radically different SEMIA logo directions — switchable via ?variant=A–E. */
export function LogoPrototypeApp() {
  const [variant, setVariant] = useState<LogoVariantKey>(readLogoVariant);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = FONT_HREF;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    const onPopState = (): void => {
      setVariant(readLogoVariant());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const content = VARIANT_MAP[variant];

  return (
    <main className="flex h-screen overflow-hidden bg-canvas text-text">
      <LogoPresentation variant={content} />
      <PrototypeSwitcher />
    </main>
  );
}

export { LOGO_VARIANTS };
