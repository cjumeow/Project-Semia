import type { YoutubeCaptionsPrototypeState } from '../youtubeCaptionTypes';
import {
  BilingualCaptionPill,
  CapturePanel,
  PrototypeStateBar,
  YouTubePlayerChrome,
} from '../prototypeShared';
import { SemiaChromeE } from '../semiaChromeVariants';

/** E — Glass: far-right frosted circle + blur popover. */
export function VariantE({ state }: { state: YoutubeCaptionsPrototypeState }) {
  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col bg-[#0f0f0f]">
        <p className="shrink-0 px-4 py-2 text-sm text-white/80">
          The state of agentic engineering mid-2026
        </p>
        <YouTubePlayerChrome
          state={state}
          semiaPlacement="far-right"
          semiaChrome={<SemiaChromeE state={state} />}
        >
          <BilingualCaptionPill state={state} />
        </YouTubePlayerChrome>
      </div>
      <CapturePanel state={state} />
      <PrototypeStateBar
        state={state}
        variantLabel="E — Glass (far-right frosted)"
      />
    </div>
  );
}
