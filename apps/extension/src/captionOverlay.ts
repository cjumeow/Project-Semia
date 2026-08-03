import overlayCss from './captionOverlay.css';
import {
  NATIVE_LINE_LOADING_TEXT,
  resolveNativeCaptionLine,
} from './captionNativeLine';
import type { MtPrewarmStatus } from './mtNativePrewarm';
import { findCueIndexByTime, getVideoElement } from './playerSync';
import { getWordText, tokenizeCue, type CueToken } from './segmenter';
import type { StoredTranscript, WordRef } from './types';

const HOST_ID = 'semia-caption-overlay-host';
const HIDE_CC_STYLE_ID = 'semia-hide-yt-captions-style';
const HIDE_CC_CLASS = 'semia-hide-yt-captions';

const HIDE_NATIVE_CC_CSS = `
  html.${HIDE_CC_CLASS} .ytp-caption-window-container,
  html.${HIDE_CC_CLASS} .caption-window {
    display: none !important;
    visibility: hidden !important;
    pointer-events: none !important;
  }
`;

export type CaptionOverlay = {
  setTranscript: (transcript: StoredTranscript | null) => void;
  setNativeLineSuppressed: (suppressed: boolean) => void;
  setSkipTlangPairing: (skip: boolean) => void;
  setMtNativeState: (state: MtNativeOverlayState) => void;
  destroy: () => void;
};

export type MtNativeOverlayState = {
  translationsByCueIndex: ReadonlyMap<number, string>;
  prewarmStatus: MtPrewarmStatus;
};

export function createCaptionOverlay(options: {
  onWordClick: (ref: WordRef) => void;
}): CaptionOverlay {
  const existing = document.getElementById(HOST_ID);
  existing?.remove();

  document.documentElement.classList.add(HIDE_CC_CLASS);
  if (!document.getElementById(HIDE_CC_STYLE_ID)) {
    const globalStyle = document.createElement('style');
    globalStyle.id = HIDE_CC_STYLE_ID;
    globalStyle.textContent = HIDE_NATIVE_CC_CSS;
    document.head.appendChild(globalStyle);
  }

  const host = document.createElement('div');
  host.id = HOST_ID;
  host.className = 'hidden';

  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = overlayCss;
  shadow.appendChild(style);

  const root = document.createElement('div');
  shadow.appendChild(root);

  let transcript: StoredTranscript | null = null;
  let tokensByCue: CueToken[][] = [];
  let timeListenerAttached = false;
  let activeCueIndex = -1;
  let playerParent: HTMLElement | null = null;
  let nativeLineSuppressed = false;
  let skipTlangPairing = false;
  let mtTranslations = new Map<number, string>();
  let mtPrewarmStatus: MtPrewarmStatus = 'idle';

  function escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function rebuildTokens(): void {
    const lang = transcript?.languageCode ?? 'en';
    tokensByCue =
      transcript?.segments.map((seg) => tokenizeCue(seg.text, lang)) ?? [];
  }

  function mountToPlayer(): boolean {
    const player =
      document.querySelector<HTMLElement>('#movie_player') ??
      document.querySelector<HTMLElement>('.html5-video-player');
    if (!player) return false;
    if (playerParent !== player) {
      playerParent = player;
      if (!player.contains(host)) {
        const pos = getComputedStyle(player).position;
        if (pos === 'static') {
          player.style.position = 'relative';
        }
        player.appendChild(host);
      }
    }
    return true;
  }

  function renderCue(cueIndex: number): void {
    if (!transcript || cueIndex < 0) {
      host.classList.add('hidden');
      root.innerHTML = '';
      return;
    }

    const seg = transcript.segments[cueIndex];
    if (!seg) {
      host.classList.add('hidden');
      root.innerHTML = '';
      return;
    }

    if (!mountToPlayer()) {
      host.classList.add('hidden');
      return;
    }

    host.classList.remove('hidden');
    const tokens = tokensByCue[cueIndex] ?? [];
    const tokenHtml = tokens
      .map((token) => {
        if (!token.isWord) {
          return `<span class="caption-punct">${escapeHtml(token.text)}</span>`;
        }
        return `<span class="caption-word" data-cue="${cueIndex}" data-word="${token.wordIndex}">${escapeHtml(token.text)}</span>`;
      })
      .join('');

    const nativeResult = resolveNativeCaptionLine(
      seg,
      transcript.nativeSegments,
      {
        nativeLineSuppressed,
        skipTlangPairing,
        learningSegmentCount: transcript.segments.length,
        cueIndex,
        mtTranslations,
        mtPrewarmActive: mtPrewarmStatus === 'loading',
      },
    );
    let nativeHtml = '';
    if (nativeResult.status === 'text') {
      nativeHtml = `<div class="caption-line-native">${escapeHtml(nativeResult.text)}</div>`;
    } else if (nativeResult.status === 'loading') {
      nativeHtml = `<div class="caption-line-native caption-line-native-loading">${escapeHtml(NATIVE_LINE_LOADING_TEXT)}</div>`;
    }

    root.innerHTML = `<div class="caption-pill"><div class="caption-line-learning">${tokenHtml}</div>${nativeHtml}</div>`;

    root.querySelectorAll<HTMLElement>('.caption-word').forEach((el) => {
      el.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        const c = Number(el.dataset.cue);
        const w = Number(el.dataset.word);
        if (!Number.isFinite(c) || !Number.isFinite(w)) return;
        const text = getWordText(tokensByCue[c] ?? [], w);
        if (!text) return;
        options.onWordClick({ cueIndex: c, wordIndex: w });
      });
    });
  }

  function syncCueFromPlayer(): void {
    if (!transcript?.segments.length) return;
    const video = getVideoElement();
    if (!video) return;

    const idx = findCueIndexByTime(transcript.segments, video.currentTime);
    if (idx < 0) return;
    if (idx !== activeCueIndex) {
      activeCueIndex = idx;
      renderCue(idx);
    }
  }

  function onTimeUpdate(): void {
    syncCueFromPlayer();
  }

  function attachTimeListener(): void {
    if (timeListenerAttached) return;
    const video = getVideoElement();
    if (!video) return;
    video.addEventListener('timeupdate', onTimeUpdate);
    timeListenerAttached = true;
  }

  function detachTimeListener(): void {
    const video = getVideoElement();
    if (video && timeListenerAttached) {
      video.removeEventListener('timeupdate', onTimeUpdate);
    }
    timeListenerAttached = false;
  }

  function setTranscript(next: StoredTranscript | null): void {
    transcript = next;
    rebuildTokens();
    activeCueIndex = -1;

    if (!next?.segments.length) {
      host.classList.add('hidden');
      root.innerHTML = '';
      detachTimeListener();
      return;
    }

    attachTimeListener();
    syncCueFromPlayer();
  }

  const playerPoll = window.setInterval(() => {
    if (!transcript?.segments.length) return;
    if (!timeListenerAttached && getVideoElement()) {
      attachTimeListener();
      syncCueFromPlayer();
    }
    if (transcript && !playerParent?.contains(host)) {
      mountToPlayer();
      if (activeCueIndex >= 0) renderCue(activeCueIndex);
    }
  }, 1000);

  function setMtNativeState(state: MtNativeOverlayState): void {
    mtTranslations = new Map(state.translationsByCueIndex);
    mtPrewarmStatus = state.prewarmStatus;
    if (activeCueIndex >= 0) {
      renderCue(activeCueIndex);
    }
  }

  function setSkipTlangPairing(skip: boolean): void {
    skipTlangPairing = skip;
    if (activeCueIndex >= 0) {
      renderCue(activeCueIndex);
    }
  }

  function setNativeLineSuppressed(suppressed: boolean): void {
    nativeLineSuppressed = suppressed;
    if (activeCueIndex >= 0) {
      renderCue(activeCueIndex);
    }
  }

  function destroy(): void {
    window.clearInterval(playerPoll);
    detachTimeListener();
    document.documentElement.classList.remove(HIDE_CC_CLASS);
    document.getElementById(HIDE_CC_STYLE_ID)?.remove();
    host.remove();
  }

  return {
    setTranscript,
    setNativeLineSuppressed,
    setSkipTlangPairing,
    setMtNativeState,
    destroy,
  };
}
