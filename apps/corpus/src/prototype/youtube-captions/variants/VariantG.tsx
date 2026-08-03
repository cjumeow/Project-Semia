import type { YoutubeCaptionsPrototypeState } from '../youtubeCaptionTypes';
import { SemiaChromeG } from '../semiaChromeVariants';
import { ChromeVariantLayout } from './ChromeVariantLayout';

export function VariantG({ state }: { state: YoutubeCaptionsPrototypeState }) {
  return (
    <ChromeVariantLayout
      state={state}
      chrome={<SemiaChromeG state={state} />}
      variantLabel="G — Icon: semicolon (pause point)"
    />
  );
}
