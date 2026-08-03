import type { YoutubeCaptionsPrototypeState } from '../youtubeCaptionTypes';
import { SemiaChromeJ } from '../semiaChromeVariants';
import { ChromeVariantLayout } from './ChromeVariantLayout';

export function VariantJ({ state }: { state: YoutubeCaptionsPrototypeState }) {
  return (
    <ChromeVariantLayout
      state={state}
      chrome={<SemiaChromeJ state={state} />}
      variantLabel="J — Icon: layered S"
    />
  );
}
