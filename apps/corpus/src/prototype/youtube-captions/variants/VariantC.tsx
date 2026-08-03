import type { YoutubeCaptionsPrototypeState } from '../youtubeCaptionTypes';
import {
  BilingualCaptionPill,
  CapturePanel,
  PrototypeStateBar,
  SubtitleSettingsFields,
  YouTubePlayerChrome,
} from '../prototypeShared';

/** C — Split control: icon toggles bilingual; chevron opens settings popover. */
export function VariantC({ state }: { state: YoutubeCaptionsPrototypeState }) {
  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col bg-[#0f0f0f]">
        <p className="shrink-0 px-4 py-2 text-sm text-white/80">
          The state of agentic engineering mid-2026
        </p>
        <YouTubePlayerChrome
          state={state}
          hideSemiaIcon
          controlsExtra={
            <div className="relative mr-1 flex items-center rounded-lg bg-white/5 p-0.5">
              <button
                type="button"
                className={[
                  'rounded-md px-2 py-1 text-[10px] font-medium',
                  state.bilingualEnabled
                    ? 'bg-white/15 text-white'
                    : 'text-white/50',
                ].join(' ')}
                onClick={() => state.toggleBilingual()}
                title="Toggle bilingual"
              >
                雙語
              </button>
              <button
                type="button"
                className="rounded-md px-1.5 py-1 text-xs text-white/70 hover:bg-white/10 hover:text-white"
                title="Subtitle settings"
                onClick={() => state.setSettingsPopoverOpen(true)}
              >
                ▾
              </button>
              {state.settingsPopoverOpen ? (
                <div className="absolute bottom-full right-0 z-50 mb-2 w-64 rounded-xl border border-white/15 bg-[#212121] p-4 shadow-2xl">
                  <p className="text-sm font-medium text-white">Semia subtitles</p>
                  <div className="mt-3">
                    <SubtitleSettingsFields state={state} />
                  </div>
                </div>
              ) : null}
            </div>
          }
        >
          <BilingualCaptionPill state={state} />
        </YouTubePlayerChrome>
      </div>
      <CapturePanel state={state} />
      <PrototypeStateBar
        state={state}
        variantLabel="C — Toggle + chevron split control"
      />
    </div>
  );
}
