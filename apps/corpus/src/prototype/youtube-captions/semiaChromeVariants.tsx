import type { ReactNode } from 'react';
import type { YoutubeCaptionsPrototypeState } from './youtubeCaptionTypes';
import { SubtitleSettingsFields } from './prototypeShared';
import {
  IconBilingualStack,
  IconBrackets,
  IconLayeredS,
  IconSemicolon,
  IconSnippetTab,
  IconTranscriptArc,
} from './semiaIcons';

function SemiaLinesIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M5 8h9M5 12h14M5 16h11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M17 7l4 2.5L17 12"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PopoverShell({
  state,
  children,
  className,
}: {
  state: YoutubeCaptionsPrototypeState;
  children: ReactNode;
  className: string;
}) {
  if (!state.settingsPopoverOpen) return null;

  return (
    <div
      className={['absolute bottom-full right-0 z-50 mb-2 w-72', className].join(
        ' ',
      )}
      role="dialog"
      aria-label="Subtitle settings"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium leading-tight">Semia subtitles</p>
          <p className="mt-0.5 text-[11px] leading-tight opacity-60">
            YouTube auto-translate
          </p>
        </div>
        <button
          type="button"
          className="shrink-0 rounded px-1.5 text-lg leading-none opacity-50 hover:opacity-100"
          onClick={() => state.setSettingsPopoverOpen(false)}
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <div className="mt-3 border-t border-current/10 pt-3">{children}</div>
    </div>
  );
}

/** D — Canopy: SEMIA forest badge, warm dark popover (corpus-aligned). */
export function SemiaChromeD({ state }: { state: YoutubeCaptionsPrototypeState }) {
  const active = state.bilingualEnabled;

  return (
    <div className="relative ml-1 shrink-0">
      <button
        type="button"
        title="Semia subtitles"
        aria-label="Semia subtitles"
        aria-expanded={state.settingsPopoverOpen}
        aria-pressed={active}
        onClick={() => state.setSettingsPopoverOpen(!state.settingsPopoverOpen)}
        className={[
          'flex h-8 w-8 items-center justify-center rounded-lg shadow-lg transition-transform hover:scale-105',
          active
            ? 'bg-[#3d7a47] text-white shadow-[#2f5233]/50 ring-2 ring-[#8fd89a]/40'
            : 'bg-[#2f5233] text-white/95 shadow-[#2f5233]/35 hover:bg-[#3a6340]',
        ].join(' ')}
      >
        <SemiaLinesIcon />
      </button>
      <PopoverShell
        state={state}
        className="rounded-xl border border-[#4a8f55]/35 bg-[#141a16] p-3 text-[#e8f0ea] shadow-2xl shadow-black/60"
      >
        <SubtitleSettingsFields state={state} tone="dark" />
      </PopoverShell>
    </div>
  );
}

/** E — Glass: frosted circle, native to YouTube chrome. */
export function SemiaChromeE({ state }: { state: YoutubeCaptionsPrototypeState }) {
  const active = state.bilingualEnabled;

  return (
    <div className="relative ml-1.5 shrink-0">
      <button
        type="button"
        title="Semia subtitles"
        aria-label="Semia subtitles"
        aria-expanded={state.settingsPopoverOpen}
        aria-pressed={active}
        onClick={() => state.setSettingsPopoverOpen(!state.settingsPopoverOpen)}
        className={[
          'flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition-colors',
          active
            ? 'border-white/55 bg-white/20 text-white ring-1 ring-white/30'
            : 'border-white/25 bg-white/8 text-white/85 hover:border-white/40 hover:bg-white/14',
        ].join(' ')}
      >
        <SemiaLinesIcon />
      </button>
      <PopoverShell
        state={state}
        className="rounded-2xl border border-white/15 bg-black/72 p-3 text-white shadow-2xl backdrop-blur-2xl"
      >
        <SubtitleSettingsFields state={state} tone="dark" />
      </PopoverShell>
    </div>
  );
}

/** F — Signal: compact pill, amber bilingual indicator (Funlingo-adjacent placement, distinct look). */
export function SemiaChromeF({ state }: { state: YoutubeCaptionsPrototypeState }) {
  const active = state.bilingualEnabled;

  return (
    <div className="relative ml-2 shrink-0">
      <button
        type="button"
        title="Semia subtitles"
        aria-label="Semia subtitles"
        aria-expanded={state.settingsPopoverOpen}
        aria-pressed={active}
        onClick={() => state.setSettingsPopoverOpen(!state.settingsPopoverOpen)}
        className={[
          'relative flex h-7 items-center gap-1.5 rounded-full border px-2.5 font-mono text-[11px] font-semibold tracking-wide transition-colors',
          active
            ? 'border-amber-400/55 bg-black/70 text-amber-200'
            : 'border-white/20 bg-black/55 text-white/75 hover:border-white/35 hover:text-white',
        ].join(' ')}
      >
        <span className="text-[10px] opacity-80">S</span>
        <span className="text-white/50">·</span>
        <SemiaLinesIcon className="opacity-90" />
        {active ? (
          <span
            className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
            aria-hidden
          />
        ) : null}
      </button>
      <PopoverShell
        state={state}
        className="rounded-xl border border-amber-500/25 bg-[#12100c] p-3 text-stone-100 shadow-2xl shadow-amber-950/30"
      >
        <SubtitleSettingsFields state={state} tone="dark" />
      </PopoverShell>
    </div>
  );
}

function IconChromeShell({
  state,
  icon,
  label,
  popoverClassName,
}: {
  state: YoutubeCaptionsPrototypeState;
  icon: ReactNode;
  label: string;
  popoverClassName: string;
}) {
  const active = state.bilingualEnabled;

  return (
    <div className="relative ml-1 shrink-0">
      <button
        type="button"
        title={label}
        aria-label={label}
        aria-expanded={state.settingsPopoverOpen}
        aria-pressed={active}
        onClick={() => state.setSettingsPopoverOpen(!state.settingsPopoverOpen)}
        className={[
          'flex h-8 w-8 items-center justify-center rounded-lg border transition-all',
          active
            ? 'border-[#8fd89a]/50 bg-[#2f5233] text-white shadow-lg shadow-[#2f5233]/40 ring-2 ring-[#8fd89a]/30'
            : 'border-white/20 bg-[#141414] text-white/90 hover:border-white/35 hover:bg-[#1c1c1c]',
        ].join(' ')}
      >
        {icon}
      </button>
      <PopoverShell state={state} className={popoverClassName}>
        <SubtitleSettingsFields state={state} tone="dark" />
      </PopoverShell>
    </div>
  );
}

/** G — Icon: Semicolon (logo A — pause point). */
export function SemiaChromeG({ state }: { state: YoutubeCaptionsPrototypeState }) {
  return (
    <IconChromeShell
      state={state}
      label="Semia subtitles — semicolon"
      icon={<IconSemicolon />}
      popoverClassName="rounded-xl border border-[#4a8f55]/35 bg-[#141a16] p-3 text-[#e8f0ea] shadow-2xl shadow-black/60"
    />
  );
}

/** H — Icon: Brackets (logo B — selection). */
export function SemiaChromeH({ state }: { state: YoutubeCaptionsPrototypeState }) {
  return (
    <IconChromeShell
      state={state}
      label="Semia subtitles — brackets"
      icon={<IconBrackets />}
      popoverClassName="rounded-xl border border-[#4a8f55]/35 bg-[#141a16] p-3 text-[#e8f0ea] shadow-2xl shadow-black/60"
    />
  );
}

/** I — Icon: Transcript arc (logo C — wave). */
export function SemiaChromeI({ state }: { state: YoutubeCaptionsPrototypeState }) {
  return (
    <IconChromeShell
      state={state}
      label="Semia subtitles — transcript arc"
      icon={<IconTranscriptArc />}
      popoverClassName="rounded-xl border border-[#4a8f55]/35 bg-[#141a16] p-3 text-[#e8f0ea] shadow-2xl shadow-black/60"
    />
  );
}

/** J — Icon: Layered S (logo D — monogram). */
export function SemiaChromeJ({ state }: { state: YoutubeCaptionsPrototypeState }) {
  return (
    <IconChromeShell
      state={state}
      label="Semia subtitles — layered S"
      icon={<IconLayeredS />}
      popoverClassName="rounded-xl border border-[#4a8f55]/35 bg-[#141a16] p-3 text-[#e8f0ea] shadow-2xl shadow-black/60"
    />
  );
}

/** K — Icon: Snippet tab (logo E — index card). */
export function SemiaChromeK({ state }: { state: YoutubeCaptionsPrototypeState }) {
  return (
    <IconChromeShell
      state={state}
      label="Semia subtitles — snippet tab"
      icon={<IconSnippetTab />}
      popoverClassName="rounded-xl border border-[#4a8f55]/35 bg-[#141a16] p-3 text-[#e8f0ea] shadow-2xl shadow-black/60"
    />
  );
}

/** L — Icon: Bilingual stack (dual-line metaphor). */
export function SemiaChromeL({ state }: { state: YoutubeCaptionsPrototypeState }) {
  return (
    <IconChromeShell
      state={state}
      label="Semia subtitles — bilingual stack"
      icon={<IconBilingualStack />}
      popoverClassName="rounded-xl border border-[#4a8f55]/35 bg-[#141a16] p-3 text-[#e8f0ea] shadow-2xl shadow-black/60"
    />
  );
}
