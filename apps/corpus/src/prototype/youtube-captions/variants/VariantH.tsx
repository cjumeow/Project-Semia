import type { YoutubeCaptionsPrototypeState } from '../youtubeCaptionTypes';
import { SemiaChromeH } from '../semiaChromeVariants';
import { ChromeVariantLayout } from './ChromeVariantLayout';

export function VariantH({ state }: { state: YoutubeCaptionsPrototypeState }) {
  return (
    <ChromeVariantLayout
      state={state}
      chrome={<SemiaChromeH state={state} />}
      variantLabel="H — Icon: brackets (selection)"
    />
  );
}
