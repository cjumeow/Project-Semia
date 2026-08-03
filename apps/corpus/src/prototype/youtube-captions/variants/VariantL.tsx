import type { YoutubeCaptionsPrototypeState } from '../youtubeCaptionTypes';
import { SemiaChromeL } from '../semiaChromeVariants';
import { ChromeVariantLayout } from './ChromeVariantLayout';

export function VariantL({ state }: { state: YoutubeCaptionsPrototypeState }) {
  return (
    <ChromeVariantLayout
      state={state}
      chrome={<SemiaChromeL state={state} />}
      variantLabel="L — Icon: bilingual stack"
    />
  );
}
