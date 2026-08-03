import type { YoutubeCaptionsPrototypeState } from '../youtubeCaptionTypes';
import { SemiaChromeK } from '../semiaChromeVariants';
import { ChromeVariantLayout } from './ChromeVariantLayout';

export function VariantK({ state }: { state: YoutubeCaptionsPrototypeState }) {
  return (
    <ChromeVariantLayout
      state={state}
      chrome={<SemiaChromeK state={state} />}
      variantLabel="K — Icon: snippet tab"
    />
  );
}
