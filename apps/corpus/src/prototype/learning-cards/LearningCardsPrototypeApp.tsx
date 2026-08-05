import { useEffect, useState } from 'react';
import {
  LEARNING_CARDS_VARIANTS,
  PrototypeSwitcher,
  type LearningCardsVariantKey,
} from './PrototypeSwitcher';
import { useLearningCardsPrototypeState } from './useLearningCardsPrototypeState';
import { VariantA } from './variants/VariantA';
import { VariantB } from './variants/VariantB';
import { VariantC } from './variants/VariantC';

function readVariant(): LearningCardsVariantKey {
  const value = new URLSearchParams(window.location.search).get('variant');
  if (value === 'B' || value === 'C') return value;
  return 'A';
}

/**
 * Three variants for Learning cards flat grid — gap + border clarity.
 * ?prototype=learning-cards&variant=A|B|C
 */
export function LearningCardsPrototypeApp() {
  const [variant, setVariant] = useState<LearningCardsVariantKey>(readVariant);
  const state = useLearningCardsPrototypeState(variant);

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

export { LEARNING_CARDS_VARIANTS };
