import type { YoutubeCaptionsPrototypeState } from '../youtubeCaptionTypes';
import {
  BilingualCaptionPill,
  CapturePanel,
  PrototypeStateBar,
  YouTubePlayerChrome,
} from '../prototypeShared';

/** B — Bottom sheet instead of popover (more room for future options). */
export function VariantB({ state }: { state: YoutubeCaptionsPrototypeState }) {
  return (
    <div className="flex min-h-0 flex-1">
      <div className="relative flex min-w-0 flex-1 flex-col bg-[#0f0f0f]">
        <p className="shrink-0 px-4 py-2 text-sm text-white/80">
          The state of agentic engineering mid-2026
        </p>
        <YouTubePlayerChrome state={state} settingsAnchor="sheet">
          <BilingualCaptionPill state={state} />
        </YouTubePlayerChrome>
        {state.settingsPopoverOpen ? (
          <button
            type="button"
            className="absolute inset-0 z-40 bg-black/40"
            aria-label="Close settings"
            onClick={() => state.setSettingsPopoverOpen(false)}
          />
        ) : null}
      </div>
      <CapturePanel state={state} />
      <PrototypeStateBar state={state} variantLabel="B — Bottom sheet settings" />
    </div>
  );
}
