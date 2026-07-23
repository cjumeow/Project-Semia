import panelCss from './sidebarPanel.css';
import { getContextCueIndices } from './contextWindow';
import {
  findCueIndexByTime,
  getCurrentTime,
  getVideoElement,
  pauseVideo,
} from './playerSync';
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
import type {
  FocusRef,
  LanguageFragment,
  StoredTranscript,
  WordRef,
} from './types';

const HOST_ID = 'semia-capture-sidebar-host';

type SidebarMode = 'watch' | 'capture';

type SidebarState = {
  open: boolean;
  mode: SidebarMode;
  transcript: StoredTranscript | null;
  /** Watch-mode center cue (follows playback). */
  activeCueIndex: number;
  /** Capture-mode frozen center (= focusWord.cueIndex). */
  focusWord: FocusRef | null;
  selection: SelectionState;
  statusMessage: string;
};


function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

function createId(): string {
  return `frag_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export type CaptureSidebar = {
  open: () => void;
  close: () => void;
  toggle: () => void;
  isOpen: () => boolean;
  setTranscript: (transcript: StoredTranscript | null) => void;
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
    mode: 'watch',
    transcript: null,
    activeCueIndex: 0,
    focusWord: null,
    selection: clearSelection(),
    statusMessage: '',
  };

  let tokensByCue: CueToken[][] = [];
  let timeListenerAttached = false;
  let lastWatchCenter = -1;

  function rebuildTokens(): void {
    const lang = state.transcript?.languageCode ?? 'en';
    tokensByCue = (state.transcript?.segments ?? []).map((seg) =>
      tokenizeCue(seg.text, lang),
    );
  }

  function getCenterIndex(): number {
    if (state.mode === 'capture' && state.focusWord) {
      return state.focusWord.cueIndex;
    }
    return state.activeCueIndex;
  }

  function render(): void {
    if (!state.open) {
      root.innerHTML = '';
      return;
    }

    const segments = state.transcript?.segments ?? [];
    const center = getCenterIndex();
    const indices =
      segments.length > 0 ? getContextCueIndices(center, segments.length) : [];

    const previewText =
      state.selection.phase === 'complete'
        ? extractSelectedText(tokensByCue, state.selection.range)
        : '';

    let hint = '';
    if (!state.transcript || segments.length === 0) {
      hint = 'Waiting for transcript… Turn on captions if needed.';
    } else if (state.mode === 'watch') {
      hint = 'Click a word to focus and start selecting.';
    } else if (state.selection.phase === 'idle') {
      hint = 'Click two words to set the selection range.';
    } else if (state.selection.phase === 'awaiting-end') {
      hint = 'Click another word to finish the range.';
    } else {
      hint = 'Selection ready. Capture or click a word to reselect.';
    }

    const cuesHtml = indices
      .map((cueIndex) => {
        const seg = segments[cueIndex]!;
        const tokens = tokensByCue[cueIndex] ?? [];
        const isActive =
          state.mode === 'watch' && cueIndex === state.activeCueIndex;
        const tokenHtml = tokens
          .map((token) => {
            if (!token.isWord) {
              return `<span class="punct">${escapeHtml(token.text)}</span>`;
            }
            const ref: WordRef = { cueIndex, wordIndex: token.wordIndex };
            const classes = ['word'];
            if (
              state.focusWord &&
              wordRefsEqual(state.focusWord, ref)
            ) {
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
          <div class="cue${isActive ? ' active' : ''}" data-cue-index="${cueIndex}">
            <span class="cue-time">${formatTime(seg.start)}</span>
            <div class="words">${tokenHtml}</div>
          </div>
        `;
      })
      .join('');

    root.innerHTML = `
      <div class="panel" part="panel">
        <div class="header">
          <div>
            <div class="title">Capture any Language Piece</div>
            <div class="mode-badge">${state.mode === 'watch' ? 'watch mode' : 'capture mode'}</div>
          </div>
          <button type="button" class="close-btn" data-action="close" aria-label="Close">✕</button>
        </div>
        <div class="body">
          ${
            segments.length === 0
              ? `<div class="empty">${escapeHtml(hint)}</div>`
              : `${cuesHtml}<div class="hint">${escapeHtml(hint)}</div>`
          }
          ${
            previewText
              ? `<div class="preview"><span class="preview-label">Selected</span>${escapeHtml(previewText)}</div>`
              : ''
          }
        </div>
        <div class="footer">
          <button type="button" class="btn" data-action="clear" ${state.selection.phase === 'idle' && !state.focusWord ? 'disabled' : ''}>Clear</button>
          <button type="button" class="btn primary" data-action="capture" ${state.selection.phase !== 'complete' ? 'disabled' : ''}>Capture</button>
        </div>
        ${state.statusMessage ? `<div class="status">${escapeHtml(state.statusMessage)}</div>` : ''}
      </div>
    `;

    root
      .querySelector('[data-action="close"]')
      ?.addEventListener('click', () => close());
    root
      .querySelector('[data-action="clear"]')
      ?.addEventListener('click', () => {
        resetCaptureKeepOpen();
        render();
      });
    root
      .querySelector('[data-action="capture"]')
      ?.addEventListener('click', () => {
        void handleCapture();
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
  }

  function onWordClick(ref: WordRef): void {
    const wordText = getWordText(tokensByCue[ref.cueIndex] ?? [], ref.wordIndex);
    if (!wordText) return;

    // First word click while watching → enter Capture with focusWord
    if (state.mode === 'watch') {
      pauseVideo();
      state.mode = 'capture';
      state.focusWord = { ...ref, text: wordText };
      state.selection = clearSelection();
      state.statusMessage = '';
      render();
      return;
    }

    // Capture mode: two-click selection (focusWord stays as-is)
    state.selection = applyWordClick(state.selection, ref);
    state.statusMessage = '';
    render();
  }

  async function handleCapture(): Promise<void> {
    if (state.selection.phase !== 'complete' || !state.focusWord) return;
    const transcript = state.transcript;
    if (!transcript) return;

    const range = state.selection.range;
    const selectedText = extractSelectedText(tokensByCue, range);
    const bounds = selectionTimeBounds(transcript.segments, range);
    const center = state.focusWord.cueIndex;
    const indices = getContextCueIndices(center, transcript.segments.length);
    const contextCues = indices.map((i) => transcript.segments[i]!);

    const fragment: LanguageFragment = {
      id: createId(),
      videoId: transcript.videoId,
      videoUrl: transcript.videoUrl,
      languageCode: transcript.languageCode,
      selectedText,
      selection: range,
      focusWord: state.focusWord,
      contextCues,
      contextCueIndices: [indices[0]!, indices[indices.length - 1]!],
      start: bounds.start,
      end: bounds.end,
      capturedAt: new Date().toISOString(),
    };

    await saveFragment(fragment);
    state.statusMessage = 'Captured.';
    // Close after short feedback
    render();
    window.setTimeout(() => {
      close();
    }, 400);
  }

  function resetCaptureKeepOpen(): void {
    state.mode = 'watch';
    state.focusWord = null;
    state.selection = clearSelection();
    state.statusMessage = '';
    syncActiveCueFromPlayer(true);
  }

  function syncActiveCueFromPlayer(forceRender: boolean): void {
    if (!state.open || state.mode !== 'watch') return;
    const segments = state.transcript?.segments ?? [];
    if (segments.length === 0) return;

    const idx = findCueIndexByTime(segments, getCurrentTime());
    if (idx < 0) return;

    if (idx !== state.activeCueIndex || forceRender) {
      state.activeCueIndex = idx;
      if (idx !== lastWatchCenter || forceRender) {
        lastWatchCenter = idx;
        render();
      }
    }
  }

  function onTimeUpdate(): void {
    syncActiveCueFromPlayer(false);
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

  function open(): void {
    state.open = true;
    state.mode = 'watch';
    state.focusWord = null;
    state.selection = clearSelection();
    state.statusMessage = '';
    attachTimeListener();
    syncActiveCueFromPlayer(true);
    render();
  }

  function close(): void {
    state.open = false;
    state.mode = 'watch';
    state.focusWord = null;
    state.selection = clearSelection();
    state.statusMessage = '';
    lastWatchCenter = -1;
    detachTimeListener();
    render();
  }

  function toggle(): void {
    if (state.open) close();
    else open();
  }

  function setTranscript(transcript: StoredTranscript | null): void {
    const prevId = state.transcript?.videoId ?? null;
    const nextId = transcript?.videoId ?? null;
    state.transcript = transcript;
    rebuildTokens();

    if (prevId !== nextId) {
      state.mode = 'watch';
      state.focusWord = null;
      state.selection = clearSelection();
      state.activeCueIndex = 0;
      lastWatchCenter = -1;
      state.statusMessage = '';
    }

    if (state.open) {
      attachTimeListener();
      syncActiveCueFromPlayer(true);
    } else {
      render();
    }
  }

  function destroy(): void {
    detachTimeListener();
    host.remove();
  }

  // Re-attach time listener if video element appears later
  const videoPoll = window.setInterval(() => {
    if (state.open && !timeListenerAttached && getVideoElement()) {
      attachTimeListener();
      syncActiveCueFromPlayer(true);
    }
  }, 1000);

  const originalDestroy = destroy;
  function destroyWithPoll(): void {
    window.clearInterval(videoPoll);
    originalDestroy();
  }

  // Escape handling while open
  const onKeyDown = (ev: KeyboardEvent): void => {
    if (!state.open) return;
    if (ev.key !== 'Escape') return;

    if (state.selection.phase !== 'idle') {
      state.selection = clearSelection();
      render();
      ev.preventDefault();
      return;
    }
    if (state.mode === 'capture') {
      resetCaptureKeepOpen();
      render();
      ev.preventDefault();
      return;
    }
    close();
    ev.preventDefault();
  };
  window.addEventListener('keydown', onKeyDown, true);

  return {
    open,
    close,
    toggle,
    isOpen: () => state.open,
    setTranscript,
    destroy: () => {
      window.removeEventListener('keydown', onKeyDown, true);
      destroyWithPoll();
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
