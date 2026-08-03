import type { ReactNode } from 'react';
import {
  LEARNING_LANGUAGE_OPTIONS,
  NATIVE_LANGUAGE_OPTIONS,
  type YoutubeCaptionsPrototypeState,
} from './youtubeCaptionTypes';

export function languageSummary(state: YoutubeCaptionsPrototypeState): string {
  const learning =
    LEARNING_LANGUAGE_OPTIONS.find((o) => o.code === state.learningLanguage)
      ?.label ?? state.learningLanguage;
  const native =
    NATIVE_LANGUAGE_OPTIONS.find((o) => o.code === state.nativeLanguage)
      ?.label ?? state.nativeLanguage;
  return `${learning} → ${native}${state.bilingualEnabled ? ' · 雙語' : ''}`;
}

export function PrototypeStateBar({
  state,
  variantLabel,
}: {
  state: YoutubeCaptionsPrototypeState;
  variantLabel: string;
}) {
  const active = state.cuePairs[state.activeCueIndex];

  return (
    <footer className="pointer-events-none fixed bottom-16 inset-x-0 z-[70] mx-auto max-w-4xl px-4">
      <p className="rounded-lg border border-amber-200/80 bg-amber-50/95 px-3 py-2 font-mono text-[10px] leading-relaxed text-amber-950">
        <span className="font-semibold">{variantLabel}</span>
        {' · '}
        cue {active?.cueIndex ?? '—'} @ {active?.timestamp ?? '—'}
        {' · '}
        {languageSummary(state)}
        {' · '}
        popover={state.settingsPopoverOpen ? 'open' : 'closed'}
        {' · '}
        panel={state.capturePanelOpen ? 'open' : 'closed'}
        {' · '}
        selection=[{state.selectedWords.join(', ') || '—'}]
      </p>
    </footer>
  );
}

export function SubtitleSettingsFields({
  state,
  tone = 'dark',
}: {
  state: YoutubeCaptionsPrototypeState;
  tone?: 'light' | 'dark';
}) {
  const dark = tone === 'dark';
  const fieldClass = dark
    ? 'mt-1.5 w-full rounded-md border border-white/15 bg-white/5 px-2.5 py-2 text-sm text-white'
    : 'mt-1.5 w-full rounded-md border border-border bg-canvas px-2.5 py-2 text-sm text-text';
  const labelClass = dark
    ? 'text-[10px] font-medium uppercase tracking-wide text-white/55'
    : 'semia-section-label';
  const checkClass = dark
    ? 'mt-1 flex cursor-pointer items-center gap-2 text-sm text-white/85'
    : 'flex cursor-pointer items-center gap-2 text-sm text-text-secondary';

  return (
    <div className="space-y-2.5">
      <label className="block">
        <span className={labelClass}>Learning language</span>
        <select
          className={fieldClass}
          value={state.learningLanguage}
          onChange={(event) => {
            state.setLearningLanguage(
              event.target.value as YoutubeCaptionsPrototypeState['learningLanguage'],
            );
          }}
        >
          {LEARNING_LANGUAGE_OPTIONS.map((option) => (
            <option key={option.code} value={option.code}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className={labelClass}>Native language</span>
        <select
          className={fieldClass}
          value={state.nativeLanguage}
          onChange={(event) => {
            state.setNativeLanguage(
              event.target.value as YoutubeCaptionsPrototypeState['nativeLanguage'],
            );
          }}
        >
          {NATIVE_LANGUAGE_OPTIONS.map((option) => (
            <option key={option.code} value={option.code}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className={checkClass}>
        <input
          type="checkbox"
          checked={state.bilingualEnabled}
          onChange={(event) => {
            state.setBilingualEnabled(event.target.checked);
          }}
        />
        Show bilingual captions
      </label>
    </div>
  );
}

export function SubtitleSettingsPopover({
  state,
  className = '',
}: {
  state: YoutubeCaptionsPrototypeState;
  className?: string;
}) {
  if (!state.settingsPopoverOpen) return null;

  return (
    <div
      className={[
        'z-50 w-72 rounded-xl border border-white/15 bg-[#212121] p-3 shadow-2xl',
        className,
      ].join(' ')}
      role="dialog"
      aria-label="Subtitle settings"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium leading-tight text-white">
            Semia subtitles
          </p>
          <p className="mt-0.5 text-[11px] leading-tight text-white/50">
            YouTube auto-translate
          </p>
        </div>
        <button
          type="button"
          className="shrink-0 rounded px-1.5 text-lg leading-none text-white/50 hover:bg-white/10 hover:text-white"
          onClick={() => state.setSettingsPopoverOpen(false)}
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <div className="mt-3 border-t border-white/10 pt-3">
        <SubtitleSettingsFields state={state} />
      </div>
    </div>
  );
}

function SemiaSubtitleIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={active ? 'text-white' : 'text-white/80'}
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M7 10h6M7 13h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M16 8l3 2-3 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function YouTubePlayerChrome({
  state,
  children,
  controlsExtra,
  settingsAnchor = 'popover',
  hideSemiaIcon = false,
  semiaPlacement = 'before-settings',
  semiaChrome,
}: {
  state: YoutubeCaptionsPrototypeState;
  children?: ReactNode;
  controlsExtra?: ReactNode;
  settingsAnchor?: 'popover' | 'sheet';
  hideSemiaIcon?: boolean;
  /** before-settings = legacy A/B/C; far-right = after fullscreen (Funlingo-style). */
  semiaPlacement?: 'before-settings' | 'far-right';
  semiaChrome?: ReactNode;
}) {
  const legacySemia = hideSemiaIcon ? null : (
    <div className="relative flex shrink-0 items-center">
      <button
        type="button"
        className={[
          'flex h-9 w-9 items-center justify-center rounded hover:bg-white/10',
          state.bilingualEnabled ? 'bg-white/10' : '',
        ].join(' ')}
        title="Semia subtitles"
        onClick={() => {
          state.setSettingsPopoverOpen(!state.settingsPopoverOpen);
        }}
      >
        <SemiaSubtitleIcon active={state.bilingualEnabled} />
      </button>
      {settingsAnchor === 'popover' ? (
        <SubtitleSettingsPopover
          state={state}
          className="absolute bottom-full right-0 mb-2"
        />
      ) : null}
    </div>
  );

  const semiaControl = semiaChrome ?? legacySemia;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-black">
      <div className="relative min-h-0 flex-1">
        <div
          className="absolute inset-0 bg-gradient-to-b from-zinc-700/30 via-zinc-900 to-black"
          aria-hidden
        />
        {children}
      </div>

      <div className="relative shrink-0 px-3 pb-3 pt-1">
        <div className="mb-2 h-1 rounded-full bg-white/20">
          <div className="h-full w-[24%] rounded-full bg-red-600" />
        </div>
        <div className="flex items-center gap-1 text-white">
          <button type="button" className="rounded-full p-2 hover:bg-white/10">
            ⏸
          </button>
          <button type="button" className="rounded-full p-2 hover:bg-white/10">
            ⏭
          </button>
          <button type="button" className="rounded-full p-2 hover:bg-white/10">
            🔊
          </button>
          <span className="ml-1 font-mono text-xs tabular-nums text-white/90">
            0:06 / 26:48
          </span>
          <span className="ml-2 rounded bg-white/10 px-2 py-0.5 text-[10px] text-white/70">
            Intro ›
          </span>

          <div className="flex-1" />

          {controlsExtra}

          {semiaPlacement === 'before-settings' ? semiaControl : null}

          <button
            type="button"
            className="rounded p-1.5 text-xs font-bold text-white hover:bg-white/10"
            title="YouTube CC"
          >
            CC
          </button>

          <button type="button" className="rounded p-2 hover:bg-white/10">
            ⚙
          </button>
          <button type="button" className="rounded p-2 hover:bg-white/10">
            ⛶
          </button>

          {semiaPlacement === 'far-right' ? semiaControl : null}
        </div>

        {settingsAnchor === 'sheet' && state.settingsPopoverOpen ? (
          <div className="absolute inset-x-0 bottom-0 z-50 rounded-t-2xl border border-white/10 bg-[#212121] p-4 shadow-2xl">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
            <p className="text-sm font-medium text-white">Semia subtitles</p>
            <div className="mt-4">
              <SubtitleSettingsFields state={state} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function BilingualCaptionPill({
  state,
}: {
  state: YoutubeCaptionsPrototypeState;
}) {
  const active = state.cuePairs[state.activeCueIndex]!;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[22%] z-20 flex justify-center px-[6%]">
      <div className="pointer-events-auto max-w-[88%] rounded-2xl border border-white/10 bg-black/82 px-4 py-3 shadow-2xl backdrop-blur-sm">
        <div className="min-w-0">
          <ClickableLearningLine
            text={active.learningText}
            selectedWords={state.selectedWords}
            onToggleWord={state.toggleWord}
          />
          {state.bilingualEnabled ? (
            <p className="mt-1.5 text-center text-sm leading-snug text-white/72">
              {active.nativeText}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function CapturePanel({
  state,
}: {
  state: YoutubeCaptionsPrototypeState;
}) {
  if (!state.capturePanelOpen) return null;

  const active = state.cuePairs[state.activeCueIndex]!;
  const selectionText =
    state.selectedWords.length > 0 ? state.selectedWords.join(' ') : '';

  return (
    <aside className="flex w-[min(22rem,34vw)] shrink-0 flex-col border-l border-white/10 bg-[#f5f0e8] text-[#1c1917] shadow-2xl">
      <header className="flex items-center justify-between border-b border-black/10 px-4 py-3">
        <h2 className="font-display text-sm font-semibold">LingoPanel</h2>
        <span className="rounded bg-[#2f5233]/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-[#2f5233]">
          Semia
        </span>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        <ul className="space-y-1">
          {state.cuePairs.map((cue, index) => {
            const activeRow = index === state.activeCueIndex;
            return (
              <li key={cue.cueIndex}>
                <button
                  type="button"
                  className={[
                    'w-full rounded-lg px-2 py-2 text-left text-sm transition-colors',
                    activeRow
                      ? 'bg-[#dce8de] font-medium text-[#1c1917]'
                      : 'text-[#57534e] hover:bg-white/50',
                  ].join(' ')}
                  onClick={() => state.selectCue(index)}
                >
                  <span className="mr-2 font-mono text-[10px] text-[#78716c]">
                    {cue.timestamp}
                  </span>
                  {cue.learningText}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-black/10 bg-white px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#78716c]">
              Selection
            </p>
            <p className="mt-1 min-h-[2.5rem] font-reading text-sm">
              {selectionText || '—'}
            </p>
          </div>
          <div className="rounded-xl border border-black/10 bg-white px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#78716c]">
              Translation
            </p>
            <p className="mt-1 min-h-[2.5rem] text-sm text-[#57534e]">
              {selectionText ? active.nativeText : '—'}
            </p>
          </div>
        </div>
      </div>

      <footer className="flex gap-2 border-t border-black/10 px-4 py-3">
        <button
          type="button"
          className="flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-[#57534e]"
          onClick={() => state.setCapturePanelOpen(false)}
        >
          Back to video
        </button>
        <button
          type="button"
          className={[
            'flex-1 rounded-lg px-3 py-2 text-sm font-medium',
            selectionText
              ? 'bg-[#2f5233] text-white'
              : 'bg-black/10 text-[#a8a29e]',
          ].join(' ')}
          disabled={!selectionText}
        >
          Capture
        </button>
      </footer>
    </aside>
  );
}

export function ClickableLearningLine({
  text,
  selectedWords,
  onToggleWord,
}: {
  text: string;
  selectedWords: string[];
  onToggleWord: (word: string) => void;
}) {
  const tokens = text.split(/(\s+)/);

  return (
    <p className="text-center text-[clamp(14px,1.8vw,19px)] font-medium leading-snug text-white">
      {tokens.map((token, index) => {
        if (!token.trim()) {
          return <span key={index}>{token}</span>;
        }
        const clean = token.replace(/[^\w'-]/g, '');
        const active = selectedWords.includes(clean);
        return (
          <button
            key={index}
            type="button"
            className={[
              'rounded px-0.5 transition-colors',
              active ? 'bg-white/30' : 'hover:bg-white/15',
            ].join(' ')}
            onClick={() => onToggleWord(clean)}
          >
            {token}
          </button>
        );
      })}
    </p>
  );
}
