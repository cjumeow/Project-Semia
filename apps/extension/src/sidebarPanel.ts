import panelCss from './sidebarPanel.css';
import { getContextCueIndices, getContextCuesByTimeRange } from './contextWindow';
import { pauseVideo, playVideo, seekTo, findCueIndexByTime, getCurrentTime } from './playerSync';
import { saveFragment } from './storage';
import {
  applyWordClick,
  clearSelection,
  extractSelectedText,
  isWordInRange,
  selectionTimeBounds,
  type SelectionState,
  wordRefsEqual,
} from './selection';
import { getWordText, tokenizeCue, type CueToken } from './segmenter';
import { translateSelectionText } from './translateSelection';
import { TRANSLATION_RIPPLE_HTML } from './translationRipple';
import { contextCuesToText } from '@semia/shared';
import type {
  FocusRef,
  LanguageFragment,
  SelectionRange,
  StoredTranscript,
  WordRef,
} from './types';

const HOST_ID = 'semia-capture-sidebar-host';
const TRANSLATION_DEBOUNCE_MS = 50;
const CAPTURE_SUCCESS_MS = 750;
const PANEL_CLOSE_MS = 320;

type SidebarState = {
  open: boolean;
  transcript: StoredTranscript | null;
  /** Anchor for the ±2 context window (fixed for this capture session). */
  centerCueIndex: number;
  focusWord: FocusRef | null;
  selection: SelectionState;
  translationText: string;
  translationLoading: boolean;
  translationError: string;
  captureSuccess: boolean;
  panelEntering: boolean;
};

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m.toString().padStart(2, '0')}:${r.toString().padStart(2, '0')}`;
}

function createId(): string {
  return `frag_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export type CaptureSidebar = {
  isOpen: () => boolean;
  setTranscript: (transcript: StoredTranscript | null) => void;
  /** Open sidebar with focusWord from the video overlay. */
  beginCaptureFromOverlay: (ref: WordRef) => void;
  /** Alt+Z: open at current cue without a focus word. */
  beginCaptureFromShortcut: () => void;
  /** Alt+S: complete selection at focus word (start = end). */
  selectFocusWord: () => boolean;
  destroy: () => void;
};

export function createCaptureSidebar(): CaptureSidebar {
  const existing = document.getElementById(HOST_ID);
  existing?.remove();

  const host = document.createElement('div');
  host.id = HOST_ID;
  const shadow = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = panelCss;
  shadow.appendChild(style);

  const root = document.createElement('div');
  shadow.appendChild(root);
  document.documentElement.appendChild(host);

  const state: SidebarState = {
    open: false,
    transcript: null,
    centerCueIndex: 0,
    focusWord: null,
    selection: clearSelection(),
    translationText: '',
    translationLoading: false,
    translationError: '',
    captureSuccess: false,
    panelEntering: false,
  };

  let tokensByCue: CueToken[][] = [];
  let translationDebounceId = 0;
  let translationAbort: AbortController | null = null;
  let translationGeneration = 0;
  let isClosing = false;

  function rebuildTokens(): void {
    const lang = state.transcript?.languageCode ?? 'en';
    tokensByCue = (state.transcript?.segments ?? []).map((seg) =>
      tokenizeCue(seg.text, lang),
    );
  }

  function getCenterIndex(): number {
    return state.centerCueIndex;
  }

  function getActiveCueIndex(): number {
    const segments = state.transcript?.segments ?? [];
    if (segments.length === 0) return state.centerCueIndex;
    const idx = findCueIndexByTime(segments, getCurrentTime());
    return idx >= 0 ? idx : state.centerCueIndex;
  }

  function resolveFocusWordForSave(range: SelectionRange): FocusRef | null {
    if (state.focusWord) return state.focusWord;

    const ref = range.start;
    const text = getWordText(tokensByCue[ref.cueIndex] ?? [], ref.wordIndex);
    if (!text) return null;
    return { ...ref, text };
  }

  function resolveFocusWordForShortcut(): WordRef | null {
    if (state.focusWord) {
      return {
        cueIndex: state.focusWord.cueIndex,
        wordIndex: state.focusWord.wordIndex,
      };
    }

    // Use the capture session's center cue (not player time) when no focus word.
    const cueIndex = state.centerCueIndex;
    const tokens = tokensByCue[cueIndex] ?? [];
    const firstWord = tokens.find((t): t is CueToken & { isWord: true } => t.isWord);
    if (!firstWord) return null;
    return { cueIndex, wordIndex: firstWord.wordIndex };
  }

  function resetTranslation(): void {
    translationAbort?.abort();
    translationAbort = null;
    state.translationText = '';
    state.translationLoading = false;
    state.translationError = '';
  }

  function scheduleTranslation(): void {
    translationAbort?.abort();
    translationAbort = null;
    window.clearTimeout(translationDebounceId);

    if (state.selection.phase !== 'complete') {
      resetTranslation();
      return;
    }

    const selectedText = extractSelectedText(
      tokensByCue,
      state.selection.range,
    ).trim();
    if (!selectedText) {
      resetTranslation();
      return;
    }

    state.translationLoading = true;
    state.translationError = '';
    state.translationText = '';
    renderTranslationOnly();

    const generation = ++translationGeneration;
    translationDebounceId = window.setTimeout(() => {
      void fetchTranslation(selectedText, generation);
    }, TRANSLATION_DEBOUNCE_MS);
  }

  async function fetchTranslation(
    text: string,
    generation: number,
  ): Promise<void> {
    translationAbort?.abort();
    const controller = new AbortController();
    translationAbort = controller;

    try {
      const translated = await translateSelectionText(text, controller.signal);
      if (generation !== translationGeneration) return;
      state.translationText = translated;
      state.translationLoading = false;
      state.translationError = '';
      renderTranslationOnly();
    } catch (err) {
      if (controller.signal.aborted || generation !== translationGeneration) {
        return;
      }
      state.translationLoading = false;
      state.translationError = 'Translation unavailable.';
      renderTranslationOnly();
      console.debug('Selection translation failed:', err);
    }
  }

  function renderTranslationOnly(): void {
    const translationEl = root.querySelector<HTMLElement>(
      '[data-region="translation-body"]',
    );
    if (!translationEl) return;
    applyTranslationBody(translationEl);
  }

  function applyTranslationBody(el: HTMLElement): void {
    if (state.selection.phase !== 'complete') {
      el.textContent = '';
      return;
    }
    if (state.translationLoading) {
      el.innerHTML = TRANSLATION_RIPPLE_HTML;
      return;
    }
    if (state.translationError) {
      el.textContent = state.translationError;
      return;
    }
    el.textContent = state.translationText;
  }

  function getTranslationBodyHtml(): string {
    if (state.selection.phase !== 'complete') return '';
    if (state.translationLoading) return TRANSLATION_RIPPLE_HTML;
    if (state.translationError) return escapeHtml(state.translationError);
    return escapeHtml(state.translationText);
  }

  function getSelectionDisplay(): string {
    if (state.selection.phase !== 'complete') return '';
    return extractSelectedText(tokensByCue, state.selection.range);
  }

  function render(): void {
    if (!state.open) {
      root.innerHTML = '';
      return;
    }

    const segments = state.transcript?.segments ?? [];
    const center = getCenterIndex();
    const activeCueIndex = getActiveCueIndex();
    const indices =
      segments.length > 0 ? getContextCueIndices(center, segments.length) : [];

    const selectionText = getSelectionDisplay();
    const translationHtml = getTranslationBodyHtml();

    const cuesHtml =
      segments.length === 0
        ? `<div class="empty">Waiting for transcript… Turn on captions if needed.</div>`
        : indices
            .map((cueIndex) => {
              const seg = segments[cueIndex]!;
              const tokens = tokensByCue[cueIndex] ?? [];
              const tokenHtml = tokens
                .map((token) => {
                  if (!token.isWord) {
                    return `<span class="punct">${escapeHtml(token.text)}</span>`;
                  }
                  const ref: WordRef = {
                    cueIndex,
                    wordIndex: token.wordIndex,
                  };
                  const classes = ['word'];
                  if (state.focusWord && wordRefsEqual(state.focusWord, ref)) {
                    classes.push('focus-word');
                  }
                  if (
                    state.selection.phase === 'awaiting-end' &&
                    wordRefsEqual(state.selection.start, ref)
                  ) {
                    classes.push('selection-start');
                  }
                  if (
                    state.selection.phase === 'complete' &&
                    isWordInRange(ref, state.selection.range)
                  ) {
                    classes.push('selection-range');
                  }
                  return `<span class="${classes.join(' ')}" data-cue="${cueIndex}" data-word="${token.wordIndex}">${escapeHtml(token.text)}</span>`;
                })
                .join('');

              return `
                <div class="cue" data-cue-index="${cueIndex}">
                  <button type="button" class="cue-time${cueIndex === activeCueIndex ? ' cue-time-active' : ''}" data-action="seek-cue" data-cue-index="${cueIndex}" aria-label="Jump to ${formatTime(seg.start)}">${formatTime(seg.start)}</button>
                  <div class="words">${tokenHtml}</div>
                </div>
              `;
            })
            .join('');

    root.innerHTML = `
      <div class="panel${state.panelEntering ? ' panel-entering' : ''}" part="panel">
        <div class="header">
          <div class="title-row">
            <div class="title">LingoPanel</div>
            <button type="button" class="semia-link" data-action="open-semia">SEMIA</button>
            ${
              state.captureSuccess
                ? `<div class="capture-success" aria-live="assertive">Captured!</div>`
                : ''
            }
          </div>
        </div>
        <div class="body">
          <div class="cues">${cuesHtml}</div>
          <div class="snippet-box">
            <div class="snippet-label">Selection</div>
            <div class="snippet-body" data-region="selection-body">${escapeHtml(selectionText)}</div>
          </div>
          <div class="snippet-box">
            <div class="snippet-label">Translation</div>
            <div class="snippet-body translation" data-region="translation-body">${translationHtml}</div>
          </div>
        </div>
        <div class="footer">
          <button type="button" class="btn" data-action="back">Back to video</button>
          <button type="button" class="btn primary" data-action="capture" ${state.selection.phase !== 'complete' || state.captureSuccess ? 'disabled' : ''}>Capture It!</button>
        </div>
      </div>
    `;

    root
      .querySelector('[data-action="back"]')
      ?.addEventListener('click', () => exitCapture());
    root
      .querySelector('[data-action="open-semia"]')
      ?.addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: 'OPEN_SEMIA' });
      });
    root
      .querySelector('[data-action="capture"]')
      ?.addEventListener('click', () => {
        void handleCapture();
      });

    root.querySelectorAll<HTMLElement>('[data-action="seek-cue"]').forEach((el) => {
      el.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        const cueIndex = Number(el.dataset.cueIndex);
        if (!Number.isFinite(cueIndex)) return;
        jumpToCue(cueIndex);
      });
    });

    root.querySelectorAll<HTMLElement>('.word').forEach((el) => {
      el.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        const cueIndex = Number(el.dataset.cue);
        const wordIndex = Number(el.dataset.word);
        if (!Number.isFinite(cueIndex) || !Number.isFinite(wordIndex)) return;
        onWordClick({ cueIndex, wordIndex });
      });
    });

    if (state.panelEntering) {
      const panel = root.querySelector<HTMLElement>('.panel');
      panel?.addEventListener(
        'animationend',
        () => {
          state.panelEntering = false;
        },
        { once: true },
      );
    }
  }

  function delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }

  async function closePanelAnimated(): Promise<void> {
    if (isClosing) return;
    isClosing = true;

    const panel = root.querySelector<HTMLElement>('.panel');
    if (!panel) {
      finishExitCapture();
      isClosing = false;
      return;
    }

    await new Promise<void>((resolve) => {
      let settled = false;
      const done = (): void => {
        if (settled) return;
        settled = true;
        resolve();
      };

      const onTransitionEnd = (ev: TransitionEvent): void => {
        if (ev.target !== panel || ev.propertyName !== 'transform') return;
        panel.removeEventListener('transitionend', onTransitionEnd);
        done();
      };

      panel.addEventListener('transitionend', onTransitionEnd);
      window.setTimeout(done, PANEL_CLOSE_MS + 50);
      panel.classList.add('panel-closing');
    });

    finishExitCapture();
    isClosing = false;
  }

  function finishExitCapture(): void {
    translationGeneration += 1;
    window.clearTimeout(translationDebounceId);
    resetTranslation();
    state.open = false;
    state.captureSuccess = false;
    state.panelEntering = false;
    state.centerCueIndex = 0;
    state.focusWord = null;
    state.selection = clearSelection();
    root.innerHTML = '';
    playVideo();
  }

  function seekToCueIndex(cueIndex: number): void {
    const segments = state.transcript?.segments ?? [];
    if (cueIndex < 0 || cueIndex >= segments.length) return;
    seekTo(segments[cueIndex]!.start);
    if (state.open) render();
  }

  function navigateCaptureCue(delta: number): void {
    const segments = state.transcript?.segments ?? [];
    if (segments.length === 0) return;

    const current = findCueIndexByTime(segments, getCurrentTime());
    if (current < 0) return;

    const next = Math.max(0, Math.min(segments.length - 1, current + delta));
    if (next === current) return;
    seekToCueIndex(next);
  }

  function jumpToCue(cueIndex: number): void {
    seekToCueIndex(cueIndex);
  }

  function isTypingTarget(target: EventTarget | null): boolean {
    return (
      target instanceof HTMLElement &&
      (target.isContentEditable ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT')
    );
  }

  function onWordClick(ref: WordRef): void {
    if (!state.open) return;

    const wordText = getWordText(tokensByCue[ref.cueIndex] ?? [], ref.wordIndex);
    if (!wordText) return;

    state.selection = applyWordClick(state.selection, ref);
    scheduleTranslation();
    render();
  }

  function selectFocusWord(): boolean {
    if (!state.open) return false;

    const ref = resolveFocusWordForShortcut();
    if (!ref) return false;

    const wordText = getWordText(tokensByCue[ref.cueIndex] ?? [], ref.wordIndex);
    if (!wordText) return false;

    state.focusWord = { ...ref, text: wordText };
    state.selection = {
      phase: 'complete',
      range: { start: ref, end: ref },
    };
    scheduleTranslation();
    render();
    return true;
  }

  function openCaptureSession(options: {
    centerCueIndex: number;
    focusWord: FocusRef | null;
  }): void {
    pauseVideo();
    state.open = true;
    state.captureSuccess = false;
    state.panelEntering = true;
    state.centerCueIndex = options.centerCueIndex;
    state.focusWord = options.focusWord;
    state.selection = clearSelection();
    resetTranslation();
    render();
  }

  function beginCaptureFromOverlay(ref: WordRef): void {
    if (!state.transcript) return;
    const wordText = getWordText(tokensByCue[ref.cueIndex] ?? [], ref.wordIndex);
    if (!wordText) return;

    openCaptureSession({
      centerCueIndex: ref.cueIndex,
      focusWord: { ...ref, text: wordText },
    });
  }

  function beginCaptureFromShortcut(): void {
    if (!state.transcript?.segments.length || state.open) return;

    const idx = findCueIndexByTime(
      state.transcript.segments,
      getCurrentTime(),
    );
    const center = idx >= 0 ? idx : 0;

    openCaptureSession({
      centerCueIndex: center,
      focusWord: null,
    });
  }

  function exitCapture(): void {
    void closePanelAnimated();
  }

  async function showCaptureSuccessAndClose(): Promise<void> {
    state.captureSuccess = true;
    render();
    await delay(CAPTURE_SUCCESS_MS);
    await closePanelAnimated();
  }

  async function saveFragmentForRange(range: SelectionRange): Promise<void> {
    if (!state.transcript) return;

    const focusWord = resolveFocusWordForSave(range);
    if (!focusWord) return;

    const transcript = state.transcript;
    const selectedText = extractSelectedText(tokensByCue, range);
    const bounds = selectionTimeBounds(transcript.segments, range);
    const centerTime = (bounds.start + bounds.end) / 2;
    const { cues: contextCues, indices: contextCueIndices } =
      getContextCuesByTimeRange(transcript.segments, centerTime, 15);

    const fragment: LanguageFragment = {
      id: createId(),
      selectedText,
      contextText: contextCuesToText(contextCues),
      languageCode: transcript.languageCode,
      sourceUrl: transcript.videoUrl,
      sourceTitle: `YouTube · ${transcript.videoId}`,
      capturedAt: new Date().toISOString(),
      anchor: {
        kind: 'youtube',
        videoId: transcript.videoId,
        selection: range,
        focusWord,
        contextCues,
        contextCueIndices,
        startSeconds: bounds.start,
        endSeconds: bounds.end,
      },
    };

    await saveFragment(fragment);
    await showCaptureSuccessAndClose();
  }

  async function handleCapture(): Promise<void> {
    if (state.selection.phase !== 'complete') return;
    await saveFragmentForRange(state.selection.range);
  }

  function setTranscript(transcript: StoredTranscript | null): void {
    const prevId = state.transcript?.videoId ?? null;
    const nextId = transcript?.videoId ?? null;
    state.transcript = transcript;
    rebuildTokens();

    if (prevId !== nextId) {
      if (state.open) {
        finishExitCapture();
      } else {
        state.centerCueIndex = 0;
        state.focusWord = null;
        state.selection = clearSelection();
        resetTranslation();
        render();
      }
    } else if (state.open) {
      render();
    }
  }

  function destroy(): void {
    translationGeneration += 1;
    window.clearTimeout(translationDebounceId);
    translationAbort?.abort();
    host.remove();
  }

  const onKeyDown = (ev: KeyboardEvent): void => {
    if (!state.open) return;
    if (isTypingTarget(ev.target)) return;

    if (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') {
      if (ev.altKey || ev.metaKey || ev.ctrlKey) return;
      ev.preventDefault();
      ev.stopPropagation();
      navigateCaptureCue(ev.key === 'ArrowLeft' ? -1 : 1);
      return;
    }

    if (
      ev.altKey &&
      !ev.metaKey &&
      !ev.ctrlKey &&
      ev.code === 'KeyS'
    ) {
      ev.preventDefault();
      ev.stopPropagation();
      selectFocusWord();
      return;
    }

    if (ev.key !== 'Escape') return;

    if (state.selection.phase !== 'idle') {
      state.selection = clearSelection();
      resetTranslation();
      render();
      ev.preventDefault();
      return;
    }

    exitCapture();
    ev.preventDefault();
  };
  window.addEventListener('keydown', onKeyDown, true);

  return {
    isOpen: () => state.open,
    setTranscript,
    beginCaptureFromOverlay,
    beginCaptureFromShortcut,
    selectFocusWord,
    destroy: () => {
      window.removeEventListener('keydown', onKeyDown, true);
      destroy();
    },
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
